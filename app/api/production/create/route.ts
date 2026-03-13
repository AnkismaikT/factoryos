import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {

  try {

    console.log("📥 Incoming production request");

    const body = await req.json();

    const rawInput = Number(body.rawInput);
    const output = Number(body.output);
    const waste = Number(body.waste);

    if (isNaN(rawInput) || isNaN(output) || isNaN(waste)) {

      return new Response(
        JSON.stringify({ error: "Invalid numeric values" }),
        { status: 400 }
      );

    }

    /* ===============================
       CALCULATE YIELD
    =============================== */

    const yieldValue =
      rawInput > 0
        ? Number(((output / rawInput) * 100).toFixed(2))
        : 0;

    /* ===============================
       CALCULATE COST
    =============================== */

    const RAW_COST_PER_TON = 3000;
    const totalCost = rawInput * RAW_COST_PER_TON;

    /* ===============================
       CALCULATE REMAINING QUANTITY
    =============================== */

    const remainingQuantity = rawInput - output;

    /* ===============================
       AUTHENTICATION
    =============================== */

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const factoryId = decoded.factoryId;
    const userId = decoded.userId;

    /* ===============================
       CREATE PRODUCTION RECORD
    =============================== */

    const production = await prisma.production.create({

      data: {

        factoryId: factoryId,

        date: new Date(),

        rawInput: rawInput,

        output: output,

        waste: waste,

        yield: yieldValue,

        totalCost: totalCost,

        remainingQuantity: remainingQuantity,

        createdBy: userId

      }

    });

    /* ===============================
       UPDATE INVENTORY
    =============================== */

    await prisma.inventory.update({

      where: { factoryId: factoryId },

      data: {

        rawStock: {
          decrement: rawInput
        },

        finishedStock: {
          increment: output
        }

      }

    });

    console.log("✅ Production + Inventory updated");

    return new Response(
      JSON.stringify(production),
      { status: 200 }
    );

  } catch (error: any) {

    console.error("🔥 SERVER ERROR:", error);

    return new Response(
      JSON.stringify({
        error: "Server error",
        message: error.message
      }),
      { status: 500 }
    );

  }

}
