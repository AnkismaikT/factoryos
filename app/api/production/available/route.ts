import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const factoryId = searchParams.get("factoryId")

    if (!factoryId) {
      return NextResponse.json(
        { error: "factoryId required" },
        { status: 400 }
      )
    }

    const batches = await prisma.production.findMany({
      where: {
        factoryId,
        remainingQuantity: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
