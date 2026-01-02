// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user (case-insensitive handled by normalization)
    const user = await prisma.users.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate JWT token (1 hour expiry)
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Extract username from email
    const username = normalizedEmail.split("@")[0];

    // Safe log
    console.log("User login:", {
      userId: user.user_id,
      email: normalizedEmail,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
      token,
      username,
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
