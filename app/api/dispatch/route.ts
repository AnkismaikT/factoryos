import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ==========================================================
// AUTH HELPER (Supports Cookie + Bearer Token)
// ==========================================================
async function getUserFromToken(req?: Request) {
  let token: string | undefined;

  // 1️⃣ Check Authorization header (for curl / terminal)
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // 2️⃣ Fallback to cookie (for browser)
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const decoded: any = verifyToken(token);

  if (!decoded || !decoded.factoryId || !decoded.role || !decoded.userId) {
    throw new Error("Invalid token");
  }

  return decoded;
}

// ==========================================================
// GET — Fetch All Dispatches
// ==========================================================
export async function GET(req: Request) {
  try {
    const decoded = await getUserFromToken(req);

    const dispatches = await prisma.dispatch.findMany({
      where: { factoryId: decoded.factoryId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// ==========================================================
// POST — Create Dispatch
// ==========================================================
export async function POST(req: Request) {
  try {
    const decoded = await getUserFromToken(req);

    if (!["MANAGER", "OWNER"].includes(decoded.role)) {
      return NextResponse.json(
        { error: "Only MANAGER or OWNER can create dispatch" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const quantity = Number(body.quantity);
    const customer =
      typeof body.customer === "string" ? body.customer.trim() : "";

    if (!quantity || quantity <= 0 || !customer) {
      return NextResponse.json(
        { error: "Valid quantity and customer required" },
        { status: 400 }
      );
    }

    const dispatch = await prisma.dispatch.create({
      data: {
        factoryId: decoded.factoryId,
        customer,
        quantity,
        createdBy: decoded.userId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispatch created successfully",
      dispatch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// ==========================================================
// PATCH — Approve Dispatch (OWNER ONLY)
// ==========================================================
export async function PATCH(req: Request) {
  try {
    const decoded = await getUserFromToken(req);

    if (decoded.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only OWNER can approve dispatch" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const dispatchId = body.dispatchId;
    const pricePerUnit = Number(body.pricePerUnit);

    if (!dispatchId || !pricePerUnit || pricePerUnit <= 0) {
      return NextResponse.json(
        { error: "Dispatch ID and valid price required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const dispatch = await tx.dispatch.findUnique({
        where: { id: dispatchId },
      });

      if (!dispatch) {
        throw new Error("Dispatch not found");
      }

      if (dispatch.factoryId !== decoded.factoryId) {
        throw new Error("Access denied for this factory");
      }

      if (dispatch.status === "DISPATCHED") {
        throw new Error("Dispatch already completed");
      }

      const inventory = await tx.inventory.findUnique({
        where: { factoryId: decoded.factoryId },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      if (inventory.finishedStock < dispatch.quantity) {
        throw new Error("Insufficient finished stock");
      }

      await tx.inventory.update({
        where: { factoryId: decoded.factoryId },
        data: {
          finishedStock:
            inventory.finishedStock - dispatch.quantity,
        },
      });

      const revenue = dispatch.quantity * pricePerUnit;

      const updatedDispatch = await tx.dispatch.update({
        where: { id: dispatchId },
        data: {
          status: "DISPATCHED",
          pricePerUnit,
          revenue,
        },
      });

      return updatedDispatch;
    });

    return NextResponse.json({
      success: true,
      message: "Dispatch approved successfully",
      dispatch: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
