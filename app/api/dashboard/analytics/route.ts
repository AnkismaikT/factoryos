import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function GET() {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded:any = verifyToken(token)

    const factoryId = decoded.factoryId

    const production = await prisma.production.aggregate({

      where:{ factoryId },

      _sum:{
        output:true,
        rawInput:true,
        waste:true
      }

    })

    const inventory = await prisma.inventory.findUnique({

      where:{ factoryId }

    })

    const output = production._sum.output || 0
    const raw = production._sum.rawInput || 0
    const waste = production._sum.waste || 0

    const yieldEfficiency =
      raw > 0 ? ((output/raw)*100).toFixed(2) : 0

    return NextResponse.json({

      output,
      raw,
      waste,
      stock: inventory?.rawStock || 0,
      finished: inventory?.finishedStock || 0,
      yieldEfficiency

    })

  } catch(error){

    console.error("Dashboard analytics error:",error)

    return NextResponse.json(
      {error:"Analytics failed"},
      {status:500}
    )

  }

}
