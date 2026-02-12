import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

const MARK_PER_Q = 2;
const NEGATIVE = 0.66;
const PASS_PERCENTAGE = 33;

export async function POST(req: Request) {
  try {
    // ---------------- AUTH ----------------
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(authHeader.substring(7));
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = decoded.userId;

    // ---------------- BODY ----------------
    const {
      examId,
      attemptId,
      answers = {},
      questionTimes = {},
      totalTimeTaken = 0,
    } = await req.json();

    if (!examId || !attemptId) {
      return NextResponse.json(
        { success: false, message: "examId and attemptId required" },
        { status: 400 }
      );
    }

    const parsedExamId = Number(examId);
    const parsedAttemptId = Number(attemptId);

    if (isNaN(parsedExamId) || isNaN(parsedAttemptId)) {
      return NextResponse.json(
        { success: false, message: "Invalid examId or attemptId" },
        { status: 400 }
      );
    }

    // ---------------- VALIDATE ATTEMPT ----------------
    const attempt = await prisma.student_exam_attempts.findFirst({
      where: {
        attempt_id: parsedAttemptId,
        student_id: studentId,
        exam_id: parsedExamId,
        status: "in_progress"
      }
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Invalid or completed attempt" },
        { status: 400 }
      );
    }

    // ---------------- TOTAL QUESTIONS ----------------
    const totalQuestions = await prisma.exam_questions.count({
      where: { exam_id: parsedExamId },
    });

    if (totalQuestions === 0) {
      return NextResponse.json(
        { success: false, message: "No questions found for exam" },
        { status: 400 }
      );
    }

    // ---------------- SAVE ANSWERS ----------------
    await Promise.all(
      Object.entries(answers).map(([questionId, selectedAnswer]) =>
        prisma.student_answers.create({
          data: {
            attempt_id: parsedAttemptId,
            question_id: Number(questionId),
            selected_answer: selectedAnswer as string,
            time_taken_seconds: questionTimes[questionId] || 0,
          },
        })
      )
    );

    // ---------------- FETCH ANSWERS WITH CORRECT KEY ----------------
    const savedAnswers = await prisma.student_answers.findMany({
      where: { attempt_id: parsedAttemptId },
      include: {
        question: { select: { correct_answer: true } },
      },
    });

    // ---------------- EVALUATION ----------------
    let correct = 0;
    let wrong = 0;

    savedAnswers.forEach(ans => {
      if (ans.selected_answer === ans.question.correct_answer) {
        correct++;
      } else if (ans.selected_answer) {
        wrong++;
      }
    });

    const answeredCount = savedAnswers.length;
    const unanswered = totalQuestions - answeredCount;

    let score = correct * MARK_PER_Q - wrong * NEGATIVE;
    score = Math.max(0, score);

    const totalMarks = totalQuestions * MARK_PER_Q;
    const passMark = (totalMarks * PASS_PERCENTAGE) / 100;
    const result = score >= passMark ? "pass" : "fail";

    // ---------------- UPDATE ATTEMPT RESULT ----------------
    await prisma.student_exam_attempts.update({
      where: { attempt_id: parsedAttemptId },
      data: {
        status: 'completed',
        end_time: new Date(),
        score: new Decimal(score),
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
        total_time_seconds: totalTimeTaken,
      },
    });

    // ---------------- RESPONSE ----------------
    return NextResponse.json({
      success: true,
      attemptId,
      correct,
      wrong,
      unanswered,
      score,
      totalMarks,
      passMark,
      result,
    });

  } catch (err) {
    console.error("Submit exam error:", err);
    // Log detailed error for debugging
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        message: "Submit failed",
        error: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
