import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

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
    const attemptId = searchParams.get("attemptId");

    // If attemptId is provided, fetch single attempt
    if (attemptId) {
      const attempt = await prisma.student_exam_attempts.findFirst({
        where: {
          attempt_id: Number(attemptId),
          student_id: studentId
        },
        include: {
          exam: true
        }
      });

      if (!attempt) {
        return NextResponse.json(
          { success: false, message: "Attempt not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: attempt });
    }

    // Fetch completed attempts
    const attempts = await prisma.student_exam_attempts.findMany({
      where: {
        student_id: studentId,
        status: "completed",
      },
      include: {
        exam: {
          include: {
            exam_subject_configs: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        end_time: "desc", // Most recent first
      },
    });

    const completedExams = await Promise.all(attempts.map(async (attempt) => {
      const exam = attempt.exam;
      const subject = exam.exam_subject_configs[0]?.subject?.subject_name || "";

      let canRetake = false;
      if (exam.exam_type === "practice") {
        canRetake = true;
      } else if (exam.exam_type === "mock") {
        // Count completed attempts for this exam
        const completedCount = await prisma.student_exam_attempts.count({
          where: {
            student_id: studentId,
            exam_id: exam.exam_id,
            status: "completed",
          },
        });
        canRetake = completedCount < 2;
      } else if (exam.exam_type === "live") {
        canRetake = false;
      }

      return {
        attemptId: attempt.attempt_id,
        examId: exam.exam_id,
        title: exam.exam_title,
        subject: subject,
        duration: exam.time_limit_minutes,
        questions: exam.question_count,
        points: exam.total_marks.toString(),
        examType: exam.exam_type,
        score: attempt.score.toString(),
        completedAt: attempt.end_time?.toISOString().split('T')[0] || "N/A",
        totalTimeSeconds: attempt.total_time_seconds,
        canRetake,
        attemptNumber: attempt.attempt_number,
      };
    }));

    return NextResponse.json({ success: true, data: completedExams });
  } catch (error) {
    console.error("Error fetching student attempts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}