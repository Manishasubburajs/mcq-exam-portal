export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const examType = searchParams.get("examType");
    const dateRange = searchParams.get("dateRange");

    const where: any = {
      status: "completed",
    };

    // Date Filter
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

    // Exam Type Filter
    if (examType && examType !== "all") {
      where.exam = {
        is: { exam_type: examType },
      };
    }

    // STEP 1: Get latest attempt per student per exam
    const latestAttemptsGroup = await prisma.student_exam_attempts.groupBy({
      by: ["student_id", "exam_id"],
      where,
      _max: {
        attempt_number: true,
      },
    });

    // STEP 2: Fetch those latest attempts
    const latestAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        OR: latestAttemptsGroup
          .filter((g) => g._max.attempt_number !== null)
          .map((g) => ({
            student_id: g.student_id,
            exam_id: g.exam_id,
            attempt_number: g._max.attempt_number as number,
          })),
      },
      include: {
        exam: true,
      },
    });

    // STEP 3: Aggregate per student
    const studentMap = new Map<
      number,
      { totalScore: number; totalMarks: number; totalExams: number }
    >();

    latestAttempts.forEach((attempt) => {
      const studentId = attempt.student_id;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          totalScore: 0,
          totalMarks: 0,
          totalExams: 0,
        });
      }

      const student = studentMap.get(studentId)!;

      student.totalScore += Number(attempt.score);
      student.totalMarks += Number(attempt.exam.total_marks);
      student.totalExams += 1;
    });

    // STEP 4: Convert to array
    const resultsArray = Array.from(studentMap.entries()).map(
      ([studentId, data]) => ({
        studentId,
        totalExamsAttempted: data.totalExams,
        overallPercentage:
          data.totalMarks > 0
            ? Number(((data.totalScore / data.totalMarks) * 100).toFixed(2))
            : 0,
      }),
    );

    // STEP 5: Sort by percentage
    resultsArray.sort((a, b) => b.overallPercentage - a.overallPercentage);

    const totalRecords = resultsArray.length;
    const paginated = resultsArray.slice(skip, skip + limit);

    const studentIds = paginated.map((r) => r.studentId);

    // STEP 6: Fetch users
    const users = await prisma.users.findMany({
      where: {
        user_id: { in: studentIds },
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.user_id, u.username]));

    // STEP 7: Final results
    const results = paginated.map((r) => ({
      studentId: r.studentId,
      username: userMap.get(r.studentId) || "Unknown",
      totalExamsAttempted: r.totalExamsAttempted,
      overallPercentage: r.overallPercentage,
    }));

    return NextResponse.json({
      studentResults: results,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      currentPage: page,
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
