import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  const production = await prisma.production.findMany({
    orderBy: {
      date: "desc"
    }
  })

  return NextResponse.json(production)

}
