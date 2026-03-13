// 📁 src/app/api/student/student-subject-performance/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    // Get token from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = decoded.userId;

    // 1️⃣ Fetch all subjects
    const subjects = await prisma.subjects.findMany({
      select: {
        subject_id: true,
        subject_name: true,
      },
      orderBy: {
        subject_name: "asc",
      },
    });

    // 2️⃣ Fetch all completed attempts with exam -> subject_configs -> subject relation
    const attempts = await prisma.student_exam_attempts.findMany({
      where: {
        student_id: studentId,
        status: "completed",
      },
      select: {
        correct_answers: true,
        wrong_answers: true,
        unanswered: true,
        exam: {
          select: {
            exam_id: true,
            exam_subject_configs: {
              select: {
                subject_id: true,
              },
            },
          },
        },
      },
    });

    // 3️⃣ Calculate subject-wise accuracy
    const subjectStats = subjects.map((subject) => {
      const filteredAttempts = attempts.filter((a) =>
        a.exam.exam_subject_configs.some(
          (config) => config.subject_id === subject.subject_id
        )
      );

      const totalCorrect = filteredAttempts.reduce(
        (sum, a) => sum + Number(a.correct_answers),
        0
      );
      const totalAttempted = filteredAttempts.reduce(
        (sum, a) =>
          sum +
          Number(a.correct_answers) +
          Number(a.wrong_answers) +
          Number(a.unanswered),
        0
      );

      const accuracy =
        totalAttempted > 0
          ? Number(((totalCorrect / totalAttempted) * 100).toFixed(2))
          : 0;

      return {
        subject_id: subject.subject_id,
        subject_name: subject.subject_name,
        totalCorrect,
        totalAttempted,
        accuracy,
      };
    });

    // 4️⃣ Determine strongest & weakest subjects
    const nonZeroSubjects = subjectStats.filter((s) => s.totalAttempted > 0);
    const strongestSubject = nonZeroSubjects.reduce(
      (prev, curr) => (curr.accuracy > prev.accuracy ? curr : prev),
      nonZeroSubjects[0] || { subject_name: "", accuracy: 0 }
    );
    const weakestSubject = nonZeroSubjects.reduce(
      (prev, curr) => (curr.accuracy < prev.accuracy ? curr : prev),
      nonZeroSubjects[0] || { subject_name: "", accuracy: 0 }
    );

    // 5️⃣ Return response
    return NextResponse.json({
      success: true,
      data: {
        subjects: subjectStats,
        strongestSubject: strongestSubject.subject_name ? {
          name: strongestSubject.subject_name,
          accuracy: strongestSubject.accuracy
        } : null,
        weakestSubject: weakestSubject.subject_name ? {
          name: weakestSubject.subject_name,
          accuracy: weakestSubject.accuracy
        } : null,
      },
    });
  } catch (error) {
    console.error("❌ GET /student-subject-performance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subject performance" },
      { status: 500 }
    );
  }
}