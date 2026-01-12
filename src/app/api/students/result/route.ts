// app/api/students/exams/result/route.ts

// purpose to display the results


import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attemptId = Number(searchParams.get("attemptId"));

    if (!attemptId) {
      return NextResponse.json(
        { success: false, message: "attemptId required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.student_exam_attempts.findUnique({
      where: { attempt_id: attemptId },
      include: {
        exam: true,
        student: {
          include: {
            student_details: true,
          },
        },
        student_answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attempt,
    });

  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
