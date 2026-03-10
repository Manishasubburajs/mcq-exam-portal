import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exam_type } from "@/generated/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");

    let where: {exam_type?: exam_type} = {};

    if (
      examType &&
      examType !== "all" &&
      ["practice", "mock", "live"].includes(examType)
    ) {
      where = {
        exam_type: examType as exam_type,
      };
    }

    const exams = await prisma.exams.findMany({
      where,
      select: {
        exam_id: true,
        exam_title: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Exam list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}