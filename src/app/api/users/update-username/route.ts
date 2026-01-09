// app/api/users/update-username/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { username } = await req.json();

    if (!username || username.length < 4) {
      return NextResponse.json({ success: false, error: "Username must be at least 4 characters" }, { status: 400 });
    }

    // Check if username exists
    const existingUser = await prisma.users.findFirst({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 409 });
    }

    // Update username
    await prisma.users.update({
      where: { user_id: userId },
      data: { username },
    });

    return NextResponse.json({ success: true, message: "Username updated successfully" });
  } catch (error) {
    console.error("❌ PUT /users/update-username error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
