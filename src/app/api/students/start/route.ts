// app/api/students/exams/start/route.ts

//this for create exam attempt id and start the exam details store in todb

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ success: false }, { status: 401 });

    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user || user.role !== "student") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { examId } = await req.json();

    const exam = await prisma.exams.findUnique({
      where: { exam_id: examId },
      select: { exam_type: true }
    });

    if (!exam) {
      return NextResponse.json({ success: false, message: "Exam not found" });
    }

    const completedAttempts = await prisma.student_exam_attempts.count({
      where: {
        student_id: user.userId,
        exam_id: examId,
        status: "completed"
      }
    });

    if (exam.exam_type === "mock" && completedAttempts >= 2) {
      return NextResponse.json({ success: false, message: "Mock exam limit reached" });
    }

    if (exam.exam_type === "live" && completedAttempts >= 1) {
      return NextResponse.json({ success: false, message: "Live exam already attempted" });
    }

    const attempt = await prisma.student_exam_attempts.create({
      data: {
        student_id: user.userId,
        exam_id: examId,
        status: "in_progress", // ✅ correct enum value
        start_time: new Date() // ✅ matches your schema
      }
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.attempt_id
    });

  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
