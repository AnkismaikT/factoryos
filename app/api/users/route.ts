import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    if (!decoded?.factoryId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        factoryId: decoded.factoryId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );

  }
}
