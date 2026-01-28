export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

// Helper to determine exam state
function getExamState(exam: any) {
  // Practice & Mock exams are always available
  if (exam.exam_type === "practice" || exam.exam_type === "mock") {
    return "available";
  }

  const now = new Date();

  if (exam.scheduled_start && now < exam.scheduled_start) {
    return "upcoming";
  }

  if (exam.scheduled_end && now > exam.scheduled_end) {
    return "expired";
  }

  return "available";
}

export async function GET(req: Request) {
  try {
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
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("id");

    /* ======================================================
       SINGLE EXAM META (START EXAM)
    ====================================================== */
    if (examId) {
      const examIdNum = Number(examId);

      const assignment = await prisma.exam_assignment_students.findFirst({
        where: {
          student_id: studentId,
          assignment: { exam_id: examIdNum },
        },
        include: {
          assignment: {
            include: {
              exam: true,
            },
          },
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Exam not assigned or not found" },
          { status: 404 }
        );
      }

      const exam = assignment.assignment.exam;

      return NextResponse.json({
        success: true,
        data: {
          id: exam.exam_id,
          title: exam.exam_title,
          duration: exam.time_limit_minutes,

          // ✅ UI EXPECTS THIS
          questions: exam.question_count,

          examType: exam.exam_type,
          shuffleQuestions: assignment.assignment.shuffle_questions,
          state: getExamState(exam),
          startDate: exam.scheduled_start,
          endDate: exam.scheduled_end,

          // ✅ FROM total_marks
          points: String(exam.total_marks ?? 0),
        },
      });
    }

    /* ======================================================
       AVAILABLE EXAMS LIST (My Exams page)
    ====================================================== */
    const assignedExams = await prisma.exam_assignment_students.findMany({
      where: { student_id: studentId },
      include: {
        assignment: {
          include: {
            exam: true,
          },
        },
      },
    });

    const exams = assignedExams.map((a) => {
      const exam = a.assignment.exam;

      return {
        id: exam.exam_id,
        title: exam.exam_title,
        duration: exam.time_limit_minutes,

        // ✅ UI EXPECTS `questions`
        questions: exam.question_count,

        examType: exam.exam_type,
        state: getExamState(exam),
        startDate: exam.scheduled_start,
        endDate: exam.scheduled_end,

        // ✅ DISPLAY EXACT DB VALUE
        points: String(exam.total_marks ?? 0),
      };
    });

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
