import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = Number(params.examId);

    if (isNaN(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    // 1️⃣ Check exam exists
    const exam = await prisma.exams.findUnique({
      where: { exam_id: examId },
      select: {
        exam_id: true,
        exam_type: true,
        is_active: true,
        scheduled_end: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Only allow live exams
    if (exam.exam_type !== "live") {
      return NextResponse.json(
        { message: "Results available only for live exams" },
        { status: 400 }
      );
    }

    // 3️⃣ Check if exam is still active
    let isExamActive = exam.is_active;

    if (exam.scheduled_end) {
      const now = new Date();
      const end = new Date(exam.scheduled_end);

      if (now > end) {
        isExamActive = false;
      }
    }

    if (isExamActive) {
      return NextResponse.json(
        { message: "Live exam is still active" },
        { status: 400 }
      );
    }

    // 4️⃣ Get ALL completed attempts (IMPORTANT for correct ranking)
    const allAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        exam_id: examId,
        status: "completed",
      },
      orderBy: {
        score: "desc",
      },
    });

    const totalCount = allAttempts.length;

    // 5️⃣ Rank calculation (competition ranking 1,1,3)
    let previousScore: number | null = null;
    let currentRank = 0;

    const rankedAttempts = allAttempts.map((attempt, index) => {
      const score = Number(attempt.score ?? 0);

      if (previousScore === null) {
        currentRank = 1;
      } else if (score < previousScore) {
        currentRank = index + 1;
      }

      previousScore = score;

      return {
        ...attempt,
        score,
        rank: currentRank,
      };
    });

    // 6️⃣ Pagination AFTER ranking
    const paginatedAttempts = rankedAttempts.slice(skip, skip + limit);

    // 7️⃣ Extract student IDs
    const studentIds = paginatedAttempts.map((a) => a.student_id);

    // 8️⃣ Fetch usernames
    const students = await prisma.users.findMany({
      where: {
        user_id: { in: studentIds },
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    // 9️⃣ Create lookup map
    const studentMap = new Map<number, string>(
      students.map((s) => [s.user_id, s.username])
    );

    // 🔟 Final response mapping
    const results = paginatedAttempts.map((attempt) => ({
      attempt_id: attempt.attempt_id,
      username: studentMap.get(attempt.student_id) || "Unknown",
      score: attempt.score,
      rank: attempt.rank,
    }));

    return NextResponse.json({
      data: results,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalParticipants: totalCount,
    });

  } catch (error) {
    console.error("Results API error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}