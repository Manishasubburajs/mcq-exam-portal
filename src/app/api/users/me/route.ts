export const dynamic = "force-dynamic"; // ✅ add this

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // 1️⃣ Get token from headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // 3️⃣ Fetch user from database
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { student_details: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Return user data
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /users/me error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      birthDate,
      gender,
      school,
      grade,
      section,
    } = body;

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { user_id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
        },
      });

      const exists = await tx.student_details.findUnique({
        where: { user_id: userId },
      });

      if (exists) {
        await tx.student_details.update({
          where: { user_id: userId },
          data: {
            dob: new Date(birthDate),
            gender,
            school,
            grade,
            section,
          },
        });
      } else {
        await tx.student_details.create({
          data: {
            user_id: userId,
            dob: new Date(birthDate),
            gender,
            school,
            grade,
            section,
          },
        });
      }

      return tx.users.findUnique({
        where: { user_id: userId },
        include: { student_details: true },
      });
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("❌ PUT /users/me error:", error);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}
