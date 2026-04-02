export const dynamic = "force-dynamic";
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
        ...baseWhere,
        OR: grouped.map((g) => ({
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
      // ✅ Get actual questions shown to student
      const examQuestions = await prisma.student_exam_questions.findMany({
        where: {
          attempt_id: attempt.attempt_id,
        },
        include: {
          questions: {
            include: {
              subject: true,
              topic: true,
            },
          },
        },
      });

      // ✅ Get student answers
      const answers = await prisma.student_answers.findMany({
        where: {
          attempt_id: attempt.attempt_id,
        },
      });

      // ✅ Convert answers to map
      const answerMap = new Map<number, any>();
      for (const ans of answers) {
        answerMap.set(ans.question_id, ans);
      }

      // ✅ Subject → Topic grouping
      const topicStats: Record<
        string,
        Record<
          string,
          {
            subject: string;
            topic: string;
            total: number;
            correct: number;
            wrong: number;
            unanswered: number;
          }
        >
      > = {};

      for (const eq of examQuestions) {
        const question = eq.questions;
        const questionId = eq.question_id;

        const subjectName = question.subject.subject_name;
        const topicName = question.topic?.topic_name ?? "General";

        const studentAnswer = answerMap.get(questionId);

        if (!topicStats[subjectName]) {
          topicStats[subjectName] = {};
        }

        if (!topicStats[subjectName][topicName]) {
          topicStats[subjectName][topicName] = {
            subject: subjectName,
            topic: topicName,
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
          };
        }

        const stats = topicStats[subjectName][topicName];

        stats.total++;

        if (studentAnswer) {
          if (studentAnswer.is_correct) {
            stats.correct++;
          } else {
            stats.wrong++;
          }
        }
      }

      // ✅ Convert object → array
      const topicSummary: any[] = [];

      for (const subject of Object.values(topicStats)) {
        for (const topic of Object.values(subject)) {
          topic.unanswered = topic.total - (topic.correct + topic.wrong);
          topicSummary.push(topic);
        }
      }

      results.push({
        attemptId: attempt.attempt_id,
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
        result: attempt.result,
        topicSummary,
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
