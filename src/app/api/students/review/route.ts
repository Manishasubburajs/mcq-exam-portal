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
      },
    });

    // 2️⃣ Get exam questions
    const examQuestions = await prisma.exam_questions.findMany({
      where: {
        exam_id: attempt.exam_id,
      },
      include: {
        question: {
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
        attempt_id: attemptId,
      },
    });

    // Convert answers → map
    const answerMap: Record<number, any> = {};
    answers.forEach((ans) => {
      answerMap[ans.question_id] = ans;
    });

    // 4️⃣ Build subject + topic summary
    const subjectTopicMap: Record<
      string,
      {
        subject: string;
        topics: Record<
          string,
          {
            topic: string;
            total: number;
            correct: number;
            wrong: number;
            unanswered: number;
          }
        >;
      }
    > = {};

    for (const eq of examQuestions) {
      const subjectName = eq.question.subject.subject_name;
      const topicName = eq.question.topic?.topic_name ?? "General";

      const questionId = eq.question_id;
      const studentAnswer = answerMap[questionId];

      if (!subjectTopicMap[subjectName]) {
        subjectTopicMap[subjectName] = {
          subject: subjectName,
          topics: {},
        };
      }

      if (!subjectTopicMap[subjectName].topics[topicName]) {
        subjectTopicMap[subjectName].topics[topicName] = {
          topic: topicName,
          total: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
        };
      }

      const topicData = subjectTopicMap[subjectName].topics[topicName];

      topicData.total += 1;

      if (!studentAnswer) {
        topicData.unanswered += 1;
      } else if (studentAnswer.is_correct) {
        topicData.correct += 1;
      } else {
        topicData.wrong += 1;
      }
    }

    // Convert map → array
    const topicSummary: any[] = [];

    for (const sub of Object.values(subjectTopicMap)) {
      for (const topic of Object.values(sub.topics)) {
        topicSummary.push({
          subject: sub.subject,
          topic: topic.topic,
          total: topic.total,
          correct: topic.correct,
          wrong: topic.wrong,
          unanswered: topic.unanswered,
        });
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
