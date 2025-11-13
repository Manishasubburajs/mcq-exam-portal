// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const trimmedEmail = email.trim();

    // Check if user exists (case-insensitive)
    const user = await prisma.users.findFirst({
      where: {
        email: trimmedEmail.toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Log user credentials (safe, no password)
    console.log("User login:", {
      userId: user.user_id,
      email: trimmedEmail,
      role: user.role,
    });

    // Generate JWT token, expires in 1 hour
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" } // token valid for 1 hour from now
    );

    // Extract username from email (part before @)
    const username = trimmedEmail.split('@')[0];

    // Return success response
    return NextResponse.json({
      message: "Login successful",
      role: user.role,
      token,
      username,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
