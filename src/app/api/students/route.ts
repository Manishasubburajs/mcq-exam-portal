export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// ------------------------------------------
// GET STUDENTS ONLY (FOR ASSIGN EXAM)
// ------------------------------------------
export async function GET() {
  try {
    const students = await prisma.users.findMany({
      where: {
        role: "student",
        status: "active", // optional but recommended
      },
      select: {
        user_id: true,
        username: true,
        email: true,
      },
      orderBy: {
        user_id: "desc",
      },
    });

    return NextResponse.json(
      { success: true, data: students },
      {status: 200},
    );
  } catch (error) {
    console.error("❌ GET /api/students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
