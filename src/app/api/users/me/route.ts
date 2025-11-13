import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ============================
// GET CURRENT USER
// ============================
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log('Decoded userId:', decoded.userId);

    // Fetch user with student details
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.userId },
      include: {
        student_details: true,
      },
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedUser = {
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      grade: user.student_details?.[0]?.grade,
      section: user.student_details?.[0]?.section,
      dob: user.student_details?.[0]?.dob,
      gender: user.student_details?.[0]?.gender,
      school: user.student_details?.[0]?.school,
    };

    console.log('Query result:', formattedUser);

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    console.error("Full error:", error);
    console.error("Error stack:", (error as Error).stack);
    console.error("Error name:", (error as Error).name);
    console.error("Error code:", (error as any).code);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================
// UPDATE CURRENT USER
// ============================
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const user_id = decoded.userId;

    const body = await request.json();
    const { first_name, last_name, email, school, grade, section, dob, gender } = body;

    // Update user and student details
    const updateData: any = {
      first_name,
      last_name,
      email,
      student_details: {
        upsert: {
          create: {
            dob,
            gender,
            school,
            grade,
            section,
          },
          update: {
            dob,
            gender,
            school,
            grade,
            section,
          },
        },
      },
    };

    const updatedUser = await prisma.users.update({
      where: { user_id: user_id },
      data: updateData,
      include: {
        student_details: true,
      },
    });

    const formattedUser = {
      user_id: updatedUser.user_id,
      username: updatedUser.username,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      grade: updatedUser.student_details?.[0]?.grade,
      section: updatedUser.student_details?.[0]?.section,
      dob: updatedUser.student_details?.[0]?.dob,
      gender: updatedUser.student_details?.[0]?.gender,
      school: updatedUser.student_details?.[0]?.school,
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (error) {
    console.error("Error updating user:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}