import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/* =========================================================
   GET — Financial Summary (Today)
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

    if (!["OWNER", "MANAGER"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔹 Get today's productions
    const productions = await prisma.production.findMany({
      where: {
        factoryId: decoded.factoryId,
        createdAt: { gte: today },
      },
    });

    // 🔹 Get today's dispatches (only dispatched)
    const dispatches = await prisma.dispatch.findMany({
      where: {
        factoryId: decoded.factoryId,
        status: "DISPATCHED",
        createdAt: { gte: today },
      },
    });

    // =============================
    // CALCULATIONS
    // =============================

    const totalProductionCost = productions.reduce(
      (sum, p) => sum + p.totalCost,
      0
    );

    const totalUnitsProduced = productions.reduce(
      (sum, p) => sum + p.output,
      0
    );

    const totalDispatchRevenue = dispatches.reduce(
      (sum, d) => sum + (d.revenue || 0),
      0
    );

    const totalUnitsSold = dispatches.reduce(
      (sum, d) => sum + d.quantity,
      0
    );

    const netProfit = totalDispatchRevenue - totalProductionCost;

    const costPerUnit =
      totalUnitsProduced > 0
        ? Number((totalProductionCost / totalUnitsProduced).toFixed(2))
        : 0;

    const revenuePerUnit =
      totalUnitsSold > 0
        ? Number((totalDispatchRevenue / totalUnitsSold).toFixed(2))
        : 0;

    const marginPercent =
      totalDispatchRevenue > 0
        ? Number(((netProfit / totalDispatchRevenue) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      success: true,
      summary: {
        totalProductionCost,
        totalDispatchRevenue,
        netProfit,
        totalUnitsProduced,
        totalUnitsSold,
        costPerUnit,
        revenuePerUnit,
        marginPercent,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
