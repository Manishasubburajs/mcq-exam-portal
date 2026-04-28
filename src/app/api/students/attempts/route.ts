import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = decoded.userId;
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");
    const examId = searchParams.get("examId");
    const latestOnly = searchParams.get("latest") === "true";
    // If attemptId is provided, fetch single attempt
    if (attemptId) {
      const attempt = await prisma.student_exam_attempts.findFirst({
        where: {
          attempt_id: Number(attemptId),
          student_id: studentId,
        },
        include: {
          exam: true,
        },
      });

      if (!attempt) {
        return NextResponse.json(
          { success: false, message: "Attempt not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: attempt });
    }

    // If examId is provided, fetch all attempts for that exam
    if (examId) {
      const attempts = await prisma.student_exam_attempts.findMany({
        where: {
          student_id: studentId,
          exam_id: Number(examId),
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

      const formattedAttempts = attempts.map((attempt) => ({
        attemptNumber: attempt.attempt_number,
        correctAnswers: attempt.correct_answers,
        wrongAnswers: attempt.wrong_answers,
        unanswered: attempt.unanswered,
        score: attempt.score.toString(),
        points: attempt.exam.total_marks.toString(),
        result: attempt.result || "fail",
        completedAt: attempt.end_time
          ? formatDateToDDMMYYYY(attempt.end_time)
          : "N/A",
      }));

      return NextResponse.json({ success: true, data: formattedAttempts });
    }

    // Fetch all completed attempts
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

    let filteredAttempts = attempts;

    if (latestOnly) {
      const latestMap = new Map();

      for (const attempt of attempts) {
        if (!latestMap.has(attempt.exam_id)) {
          latestMap.set(attempt.exam_id, attempt);
        }
      }

      filteredAttempts = Array.from(latestMap.values());
    }

    const completedExams = await Promise.all(
      filteredAttempts.map(async (attempt) => {
        const exam = attempt.exam;
        const subject =
          exam.exam_subject_configs[0]?.subject?.subject_name || "";

        let canRetake = false;
        let hasReachedRetakeLimit = false;
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
          hasReachedRetakeLimit = !canRetake;
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
          completedAt: attempt.end_time
            ? formatDateToDDMMYYYY(attempt.end_time)
            : "N/A",
          endTime: exam.scheduled_end, // Use exam's scheduled end time for calculation
          totalTimeSeconds: attempt.total_time_seconds,
          canRetake,
          hasReachedRetakeLimit,
          attemptNumber: attempt.attempt_number,
          correctAnswers: attempt.correct_answers,
          wrongAnswers: attempt.wrong_answers,
          unanswered: attempt.unanswered,
          result: attempt.result || "fail",
        };
      }),
    );

    return NextResponse.json({ success: true, data: completedExams });
  } catch (error) {
    console.error("Error fetching student attempts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attempts" },
      { status: 500 },
    );
  }
}
