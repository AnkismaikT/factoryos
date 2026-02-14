import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { calculateWaste, calculateYield } from "@/lib/calculations";

/* =========================================================
   POST — Record Production
========================================================= */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    if (!decoded?.factoryId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!["OPERATOR", "MANAGER", "OWNER"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const rawInput = Number(body.rawInput);
    const output = Number(body.output);

    if (!rawInput || !output) {
      return NextResponse.json(
        { error: "Raw input and output required" },
        { status: 400 }
      );
    }

    if (rawInput <= 0 || output <= 0) {
      return NextResponse.json(
        { error: "Values must be greater than zero" },
        { status: 400 }
      );
    }

    if (output > rawInput) {
      return NextResponse.json(
        { error: "Output cannot exceed raw input" },
        { status: 400 }
      );
    }

    const waste = calculateWaste(rawInput, output);
    const yieldPercent = calculateYield(rawInput, output);

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { factoryId: decoded.factoryId },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      if (inventory.rawStock < rawInput) {
        throw new Error("Insufficient raw stock");
      }

      await tx.inventory.update({
        where: { factoryId: decoded.factoryId },
        data: {
          rawStock: inventory.rawStock - rawInput,
          finishedStock: inventory.finishedStock + output,
        },
      });

      return await tx.production.create({
        data: {
          factoryId: decoded.factoryId,
          date: new Date(),
          rawInput,
          output,
          waste,
          yield: yieldPercent,
          createdBy: decoded.userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Production recorded successfully",
      production: result,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET — Fetch Production History (Today)
========================================================= */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    if (!decoded?.factoryId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const productions = await prisma.production.findMany({
      where: {
        factoryId: decoded.factoryId,
        createdAt: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalRaw = productions.reduce((sum, p) => sum + p.rawInput, 0);
    const totalOutput = productions.reduce((sum, p) => sum + p.output, 0);
    const totalWaste = productions.reduce((sum, p) => sum + p.waste, 0);

    const averageYield =
      totalRaw > 0 ? Number(((totalOutput / totalRaw) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      count: productions.length,
      summary: {
        totalRaw,
        totalOutput,
        totalWaste,
        averageYield,
      },
      data: productions,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

