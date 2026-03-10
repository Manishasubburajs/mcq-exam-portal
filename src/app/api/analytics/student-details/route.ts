import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const studentId = Number(searchParams.get("studentId"));
    const examTypeParam = searchParams.get("examType");
    const selectedExam = searchParams.get("examId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    const validExamTypes = ["live", "mock", "practice"] as const;
    const examType = validExamTypes.includes(examTypeParam as any)
      ? (examTypeParam as (typeof validExamTypes)[number])
      : undefined;

    const baseWhere: any = {
      student_id: studentId,
      status: "completed",
    };

    if (examType) {
      baseWhere.exam = { exam_type: examType };
    }

    if (selectedExam && selectedExam !== "all") {
      baseWhere.exam_id = Number(selectedExam);
    }

    // ✅ 1️⃣ Get latest attempt per exam
    const grouped = await prisma.student_exam_attempts.groupBy({
      by: ["exam_id"],
      where: baseWhere,
      _max: {
        attempt_number: true,
      },
    });

    if (grouped.length === 0) {
      return NextResponse.json({ studentResults: [] });
    }

    // ✅ 2️⃣ Fetch latest attempts
    const latestAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        OR: grouped.map((g) => ({
          student_id: studentId,
          exam_id: g.exam_id,
          attempt_number: g._max.attempt_number!,
        })),
      },
      include: {
        exam: true,
      },
      orderBy: {
        start_time: "desc",
      },
    });

    const results = [];

    for (const attempt of latestAttempts) {
      // 🔥 Get ALL questions of this exam
      const examQuestions = await prisma.exam_questions.findMany({
        where: {
          exam_id: attempt.exam_id,
        },
        include: {
          question: {
            include: {
              subject: true,
            },
          },
        },
      });

      // 🔥 Get student answers
      const answers = await prisma.student_answers.findMany({
        where: {
          attempt_id: attempt.attempt_id,
        },
      });

      // 🔥 Convert answers → map
      const answerMap: Record<number, any> = {};
      for (const ans of answers) {
        answerMap[ans.question_id] = ans;
      }

      // 🔥 Subject grouping
      const subjectMap: Record<
        string,
        {
          subject: string;
          total: number;
          correct: number;
          wrong: number;
          unanswered: number;
        }
      > = {};

      for (const eq of examQuestions) {
        const subjectName = eq.question.subject.subject_name;
        const questionId = eq.question_id;
        const studentAnswer = answerMap[questionId];

        if (!subjectMap[subjectName]) {
          subjectMap[subjectName] = {
            subject: subjectName,
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
          };
        }

        subjectMap[subjectName].total += 1;

        if (!studentAnswer) {
          subjectMap[subjectName].unanswered += 1;
        } else if (studentAnswer.is_correct) {
          subjectMap[subjectName].correct += 1;
        } else {
          subjectMap[subjectName].wrong += 1;
        }
      }

      const subjectSummary = Object.values(subjectMap).map((sub) => {
        return {
          subject: sub.subject,
          total: sub.total,
          correct: sub.correct,
          wrong: sub.wrong,
          unanswered: sub.unanswered,
        };
      });

      results.push({
        examId: attempt.exam_id,
        examTitle: attempt.exam.exam_title,
        examType: attempt.exam.exam_type,
        score: Number(attempt.score),
        attempts: attempt.attempt_number,
        correct: attempt.correct_answers,
        incorrect: attempt.wrong_answers,
        unanswered: attempt.unanswered,
        timeSpent: attempt.total_time_seconds
          ? `${Math.floor(attempt.total_time_seconds / 60)} min ${
              attempt.total_time_seconds % 60
            } sec`
          : "0 min 0 sec",
        accuracy: attempt.accuracy?.toFixed(2),
        subjectSummary,
      });
    }

    return NextResponse.json({
      studentResults: results,
    });
  } catch (error) {
    console.error("Student Details Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 },
    );
  }
}
