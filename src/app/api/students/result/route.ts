// app/api/students/result/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attemptId = Number(searchParams.get("attemptId"));

    if (!attemptId) {
      return NextResponse.json(
        { success: false, message: "attemptId required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch the attempt with exam, student_exam_questions and student_answers
    const attempt = await prisma.student_exam_attempts.findUnique({
      where: { attempt_id: attemptId },
      include: {
        exam: true,
        student_exam_questions: {
          include: { questions: true },
          orderBy: { question_order: "asc" },
        },
        student_answers: true, // include answers to map to questions
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Result not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch student info separately (with student_details)
    const student = await prisma.users.findUnique({
      where: { user_id: attempt.student_id },
      include: { student_details: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Map student_exam_questions with answers
  const questions = attempt.student_exam_questions.map((sq) => {
    const answer = attempt.student_answers.find(
      (a) => a.question_id === sq.question_id
    );

    const q = sq.questions;

    const selectedAnswer = answer?.selected_answer || null;
    const isCorrect = answer?.is_correct || false;

    return {
      id: q.question_id,
      questionOrder: sq.question_order,
      text: q.question_text,
        options: [
          { id: "A", text: q.option_a },
          { id: "B", text: q.option_b },
          { id: "C", text: q.option_c },
          { id: "D", text: q.option_d },
        ].filter((o) => o.text).map((opt) => ({
          ...opt,
          correct: opt.id === q.correct_answer,
          selected: opt.id === selectedAnswer,
        })),
        selectedAnswer,
        isCorrect,
        status: selectedAnswer
          ? isCorrect
            ? "correct"
            : "incorrect"
          : "unanswered",
        timeTaken: answer?.time_taken_seconds || 0,
        explanation: q.explanation,
      };
    });

    // 4️⃣ Return final response
    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          attempt_id: attempt.attempt_id,
          student_id: attempt.student_id,
          exam_id: attempt.exam_id,
          start_time: attempt.start_time,
          end_time: attempt.end_time,
          total_time_seconds: attempt.total_time_seconds,
          score: attempt.score,
          correct_answers: attempt.correct_answers,
          wrong_answers: attempt.wrong_answers,
          unanswered: attempt.unanswered,
          accuracy: attempt.accuracy,
          result: attempt.result || "fail",
          status: attempt.status,
          attempt_number: attempt.attempt_number,
        },
        student,
        exam: attempt.exam,
        questions,
      },
    });
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}