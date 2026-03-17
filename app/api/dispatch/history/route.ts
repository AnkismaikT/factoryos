import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {

  try {

    console.log("Dispatch history API called")

    const result = await db.query(`
      SELECT *
      FROM dispatch
      ORDER BY created_at DESC
    `)

    console.log("Dispatch rows:", result.rows)

    return NextResponse.json(result.rows)

  } catch (error) {

    console.error("Dispatch history error:", error)

    return NextResponse.json(
      { error: "Dispatch fetch failed", details: String(error) },
      { status: 500 }
    )

  }

}
