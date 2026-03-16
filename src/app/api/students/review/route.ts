export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = Number(searchParams.get("attemptId"));

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 },
      );
    }

    // 1️⃣ Get attempt details
    const attempt = await prisma.student_exam_attempts.findUnique({
      where: { attempt_id: attemptId },
      include: {
        exam: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get number of attempts for this student in this exam
    const attemptsCount = await prisma.student_exam_attempts.count({
      where: {
        student_id: attempt.student_id,
        exam_id: attempt.exam_id,
        status: "completed",
      },
    });

    // 🔥 Get latest attempt per student for this exam
    const latestAttemptsPerStudent = await prisma.student_exam_attempts.groupBy(
      {
        by: ["student_id"],
        where: {
          exam_id: attempt.exam_id,
          status: "completed",
        },
        _max: {
          attempt_number: true,
        },
      },
    );

    // 🔥 Fetch those latest attempts
    const latestAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        exam_id: attempt.exam_id,
        status: "completed",
        OR: latestAttemptsPerStudent.map((g) => ({
          student_id: g.student_id,
          attempt_number: g._max.attempt_number!,
        })),
      },
    });

    // 🔥 Calculate rank
    const higherScores = latestAttempts.filter(
      (a) => Number(a.score) > Number(attempt.score),
    ).length;

    const rank = higherScores + 1;

    // 🔥 Find Topper (Rank 1)
    const topper = latestAttempts.reduce((prev, current) =>
      Number(current.score) > Number(prev.score) ? current : prev,
    );

    // 🔥 Get topper attempts count
    const topperAttempts = await prisma.student_exam_attempts.count({
      where: {
        student_id: topper.student_id,
        exam_id: attempt.exam_id,
        status: "completed",
      },
    });

    // 2️⃣ Get exam questions
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

    // 3️⃣ Get student answers
    const answers = await prisma.student_answers.findMany({
      where: {
        attempt_id: attempt.attempt_id,
      },
    });

    // Convert answers → map
    const answerMap = new Map<number, any>();
    for (const ans of answers) {
      answerMap.set(ans.question_id, ans);
    }

    // 4️⃣ Build subject + topic summary
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

    // Convert map → array
    const topicSummary: any[] = [];

    for (const subject of Object.values(topicStats)) {
      for (const topic of Object.values(subject)) {
        topic.unanswered = topic.total - (topic.correct + topic.wrong);
        topicSummary.push(topic);
      }
    }

    // 5️⃣ Return response
    return NextResponse.json({
      examId: attempt.exam_id,
      examTitle: attempt.exam.exam_title,
      examType: attempt.exam.exam_type,
      score: Number(attempt.score),
      rank: rank,
      topperScore: Number(topper.score),
      topperCorrect: topper.correct_answers,
      topperIncorrect: topper.wrong_answers,
      topperUnanswered: topper.unanswered,
      topperAttempt: topperAttempts,
      topperAccuracy: topper.accuracy?.toFixed(2),
      topperTime: topper.total_time_seconds
        ? `${Math.floor(topper.total_time_seconds / 60)} min ${
            topper.total_time_seconds % 60
          } sec`
        : "0 min 0 sec",
      topperResult: topper.result,

      correct: attempt.correct_answers,
      incorrect: attempt.wrong_answers,
      unanswered: attempt.unanswered,
      accuracy: attempt.accuracy?.toFixed(2),
      result: attempt.result,
      attempts: attemptsCount,
      timeSpent: attempt.total_time_seconds
        ? `${Math.floor(attempt.total_time_seconds / 60)} min ${
            attempt.total_time_seconds % 60
          } sec`
        : "0 min 0 sec",
      topicSummary,
    });
  } catch (error) {
    console.error("Student Review Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch review details" },
      { status: 500 },
    );
  }
}
