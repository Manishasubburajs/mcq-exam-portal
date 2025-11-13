// 📁 src/app/api/subjects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const subjects = await prisma.subjects.findMany({
      select: {
        subject_id: true,
        subject_name: true,
      },
      orderBy: {
        subject_name: "asc",
      },
    });
    return NextResponse.json({ success: true, data: subjects });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load subjects" },
      { status: 500 }
    );
  }
}
