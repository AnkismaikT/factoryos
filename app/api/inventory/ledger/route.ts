import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  try {

    const production = await prisma.production.findMany({
      orderBy: { date: "desc" }
    })

    const ledger = production.map((p) => ({
      id: p.id,
      date: p.date,
      material: "Raw Material",
      type: "Production",
      quantity: -p.rawInput,
      balance: p.remainingQuantity
    }))

    return NextResponse.json(ledger)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Inventory calculation failed" },
      { status: 500 }
    )

  }

}
