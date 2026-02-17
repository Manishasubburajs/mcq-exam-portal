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
        scheduled_end: true, // ✅ Added
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

    // 3️⃣ Check if exam is still active (with time logic)
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

    // 4️⃣ Get total completed attempts
    const totalCount = await prisma.student_exam_attempts.count({
      where: {
        exam_id: examId,
        status: "completed",
      },
    });

    // 5️⃣ Get paginated completed attempts ordered by score DESC
    const attempts = await prisma.student_exam_attempts.findMany({
      where: {
        exam_id: examId,
        status: "completed",
      },
      orderBy: {
        score: "desc",
      },
      skip,
      take: limit,
    });

    // 6️⃣ Extract student IDs
    const studentIds = attempts.map((attempt) => attempt.student_id);

    // 7️⃣ Fetch usernames
    const students = await prisma.users.findMany({
      where: {
        user_id: { in: studentIds },
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    // 8️⃣ Create lookup map
    const studentMap = new Map<number, string>(
      students.map((student) => [student.user_id, student.username])
    );

    // 9️⃣ Merge data + add rank
    const results = attempts.map((attempt, index) => ({
      attempt_id: attempt.attempt_id,
      username: studentMap.get(attempt.student_id) || "Unknown",
      score: attempt.score ? Number(attempt.score) : 0,
      rank: skip + index + 1,
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
