import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, factoryName } = await req.json();

    if (!name || !email || !password || !factoryName) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create factory
    const factory = await prisma.factory.create({
      data: {
        name: factoryName,
      },
    });

    // Create inventory for factory
    await prisma.inventory.create({
      data: {
        factoryId: factory.id,
        rawStock: 0,
        finishedStock: 0,
      },
    });

    // Create owner user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER",
        factoryId: factory.id,
      },
    });

    return NextResponse.json({
      message: "Factory and Owner created successfully",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

