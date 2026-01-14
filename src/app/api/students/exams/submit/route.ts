// app/api/students/exams/submit/route.ts

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

const MARK_PER_Q = 2;
const NEGATIVE = 0.66;
const PASS_PERCENTAGE = 33;

export async function POST(req: Request) {
  try {
    // ---------------- AUTH ----------------
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

    // ---------------- REQUEST BODY ----------------
    const {
      attemptId,
      answers,
      questionTimes,
      totalTimeTaken,
    } = await req.json();

    // ---------------- VERIFY ATTEMPT ----------------
    const attempt = await prisma.student_exam_attempts.findFirst({
      where: {
        attempt_id: Number(attemptId),
        student_id: studentId,
        status: "in_progress",
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "No active attempt found" },
        { status: 404 }
      );
    }

    // ---------------- SAVE ANSWERS ----------------
    const savePromises = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => {
        const timeTaken = questionTimes?.[questionId] || 0;

        return prisma.student_answers.upsert({
          where: {
            attempt_id_question_id: {
              attempt_id: Number(attemptId),
              question_id: Number(questionId),
            },
          },
          update: {
            selected_answer: selectedAnswer as string,
            time_taken_seconds: timeTaken,
          },
          create: {
            attempt_id: Number(attemptId),
            question_id: Number(questionId),
            selected_answer: selectedAnswer as string,
            time_taken_seconds: timeTaken,
          },
        });
      }
    );

    await Promise.all(savePromises);

    // ---------------- FETCH ANSWERS ----------------
    const savedAnswers = await prisma.student_answers.findMany({
      where: { attempt_id: Number(attemptId) },
      include: {
        question: {
          select: { correct_answer: true },
        },
      },
    });

    // ---------------- EVALUATION ----------------
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalScore = 0;

    savedAnswers.forEach(ans => {
      if (!ans.selected_answer) {
        unanswered++;
        return;
      }

      if (ans.selected_answer === ans.question.correct_answer) {
        correct++;
        totalScore += MARK_PER_Q;
      } else {
        wrong++;
        totalScore -= NEGATIVE;
      }
    });

    // UPSC safety: no negative total
    totalScore = Math.max(0, totalScore);

    // ---------------- PASS / FAIL LOGIC ----------------
    const totalQuestions = savedAnswers.length;
    const totalMarks = totalQuestions * MARK_PER_Q;
    const passMark = (totalMarks * PASS_PERCENTAGE) / 100;

    const resultStatus =
      totalScore >= passMark ? "pass" : "fail";

    // ---------------- UPDATE ATTEMPT ----------------
    await prisma.student_exam_attempts.update({
      where: { attempt_id: Number(attemptId) },
      data: {
        status: "completed",
        end_time: new Date(),
        total_time_seconds: totalTimeTaken,
        score: totalScore,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
        result_status: resultStatus,
      },
    });

    // ---------------- RESPONSE ----------------
    return NextResponse.json({
      success: true,
      correct,
      wrong,
      unanswered,
      score: totalScore,
      totalMarks,
      passMark,
      result: resultStatus,
    });

  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, message: "Submit failed" },
      { status: 500 }
    );
  }
}
