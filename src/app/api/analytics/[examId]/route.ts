export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { examId: string } },
) {
  try {
    const examId = params.examId;

    if (!examId)
      return NextResponse.json(
        { error: "examId is required" },
        { status: 400 },
      );

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const dateRange = searchParams.get("dateRange");

    // Base filter: completed attempts for the exam
    const where: any = {
      status: "completed",
      exam_id: Number(examId),
    };

    // Date filter
    if (dateRange) {
      // IST offset in minutes
      const IST_OFFSET = 5 * 60 + 30; // 5:30 hours

      const nowUTC = new Date();
      const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60 * 1000);

      let startDateIST = new Date(nowIST);
      if (dateRange === "week") startDateIST.setDate(nowIST.getDate() - 7);
      else if (dateRange === "month")
        startDateIST.setMonth(nowIST.getMonth() - 1);
      else if (dateRange === "quarter")
        startDateIST.setMonth(nowIST.getMonth() - 3);

      // Convert back to UTC for DB filter
      const startDateUTC = new Date(
        startDateIST.getTime() - IST_OFFSET * 60 * 1000,
      );

      where.start_time = { gte: startDateUTC };
    }

    // Get latest attempt per student for this exam
    const grouped = await prisma.student_exam_attempts.groupBy({
      by: ["student_id"],
      where,
      _max: { attempt_number: true },
    });

    // Fetch full data for latest attempts
    const latestAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        OR: grouped
          .filter((g) => g._max.attempt_number !== null)
          .map((g) => ({
            student_id: g.student_id,
            exam_id: Number(examId),
            attempt_number: g._max.attempt_number!,
          })),
      },
      include: { exam: true },
      orderBy: { score: "desc" },
    });

    const totalRecords = latestAttempts.length;

    // Rank calculation
    let previousScore: number | null = null;
    let currentRank = 0;

    const rankedAttempts = latestAttempts.map((attempt, index) => {
      const score = Number(attempt.score ?? 0);

      if (previousScore === null || score < previousScore) {
        currentRank = index + 1;
      }

      previousScore = score;

      return {
        ...attempt,
        rank: currentRank,
      };
    });

    // Pagination after ranking
    const paginatedAttempts = rankedAttempts.slice(skip, skip + limit);

    const userIds = paginatedAttempts.map((a) => a.student_id);
    const usersList = await prisma.users.findMany({
      where: { user_id: { in: userIds } },
    });
    const userMap = new Map(usersList.map((u) => [u.user_id, u]));

    const results = paginatedAttempts.map((attempt, index) => {
      const user = userMap.get(attempt.student_id);
      return {
        attemptId: attempt.attempt_id,
        rank: attempt.rank,
        studentId: attempt.student_id,
        username: user?.username,
        score: Number(attempt.score ?? 0),
        correctAnswers: `${attempt.correct_answers ?? 0}/${attempt.exam?.question_count ?? 0}`,
        timeSpent: attempt.total_time_seconds
          ? `${Math.floor(attempt.total_time_seconds / 60)} min ${attempt.total_time_seconds % 60} sec / ${attempt.exam?.time_limit_minutes ?? "-"} min`
          : `0 min / ${attempt.exam?.time_limit_minutes ?? "-"} min`,
        examDate: attempt.start_time,
      };
    });

    return NextResponse.json({
      studentResults: results,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      currentPage: page,
    });
  } catch (error) {
    console.error("Exam Analytics Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam analytics" },
      { status: 500 },
    );
  }
}
