import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {

  try {

    console.log("📦 Incoming dispatch request");

    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded: any = verifyToken(token);

    const factoryId = decoded.factoryId;
    const userId = decoded.userId;

    console.log("Factory:", factoryId);
    console.log("User:", userId);

    const quantity = Number(body.quantity);
    const sellingPrice = Number(body.sellingPrice);
    const productionId = body.productionId;

    if (!productionId) {
      return new Response("Production ID required", { status: 400 });
    }

    if (isNaN(quantity) || isNaN(sellingPrice)) {
      return new Response("Invalid quantity or price", { status: 400 });
    }

    /* ===============================
       CALCULATE REVENUE
    =============================== */

    const totalRevenue = quantity * sellingPrice;

    console.log("Revenue:", totalRevenue);

    /* ===============================
       CREATE DISPATCH RECORD
    =============================== */

    const dispatch = await prisma.dispatch.create({

      data: {

        factory: {
          connect: { id: factoryId }
        },

        production: {
          connect: { id: productionId }
        },

        customer: body.customer,

        quantity: quantity,

        sellingPrice: sellingPrice,

        totalRevenue: totalRevenue,

        createdBy: userId

      }

    });

    /* ===============================
       UPDATE INVENTORY
    =============================== */

    await prisma.inventory.update({

      where: { factoryId },

      data: {

        finishedStock: {
          decrement: quantity
        }

      }

    });

    console.log("Dispatch saved");

    return Response.json(dispatch);

  } catch (error: any) {

    console.error("🔥 DISPATCH ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { status: 500 }
    );

  }

}
