import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const { rawInput, output, waste } = await req.json();

    if (!rawInput || !output) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const numericRaw = Number(rawInput);
    const numericOutput = Number(output);
    const numericWaste = Number(waste || 0);

    /* ===============================
    GET INVENTORY
    =============================== */

    const inventory = await prisma.inventory.findFirst({
      where: { factoryId: decoded.factoryId },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 400 }
      );
    }

    /* ===============================
    CHECK STOCK
    =============================== */

    if (inventory.stock < numericRaw) {
      return NextResponse.json(
        { error: "Not enough raw material in stock" },
        { status: 400 }
      );
    }

    /* ===============================
    TRANSACTION
    =============================== */

    const result = await prisma.$transaction(async (tx) => {

      const production = await tx.production.create({
        data: {
          rawInput: numericRaw,
          output: numericOutput,
          waste: numericWaste,
          factoryId: decoded.factoryId,
        },
      });

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stock: inventory.stock - numericRaw,
        },
      });

      return { production, updatedInventory };
    });

    return NextResponse.json({
      message: "Production added & inventory updated",
      data: result,
    });

  } catch (error) {
    console.error("PRODUCTION ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
