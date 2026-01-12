// app/api/students/exams/submit/route.ts

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

const MARK_PER_Q = 2;
const NEGATIVE = 0.66;

export async function POST(req: Request) {
  try {
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
    const { attemptId, answers, questionTimes, totalTimeTaken, examType, autoSubmitted } = await req.json();

    // Verify the attempt belongs to the student
    const attempt = await prisma.student_exam_attempts.findFirst({
      where: {
        attempt_id: parseInt(attemptId),
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

    // Save answers
    const answerPromises = Object.entries(answers).map(async ([questionNum, selectedAnswer]) => {
      const questionId = parseInt(questionNum);
      const timeTaken = questionTimes[questionNum] || 0;

      return prisma.student_answers.upsert({
        where: {
          attempt_id_question_id: {
            attempt_id: parseInt(attemptId),
            question_id: questionId,
          },
        },
        update: {
          selected_answer: selectedAnswer as string,
          time_taken_seconds: timeTaken,
        },
        create: {
          attempt_id: parseInt(attemptId),
          question_id: questionId,
          selected_answer: selectedAnswer as string,
          time_taken_seconds: timeTaken,
        },
      });
    });

    await Promise.all(answerPromises);

    // Calculate marks
    const savedAnswers = await prisma.student_answers.findMany({
      where: { attempt_id: parseInt(attemptId) },
      include: {
        question: {
          select: { correct_answer: true, marks: true, negative_marks: true }
        }
      }
    });

    let correct = 0;
    let wrong = 0;
    let totalScore = 0;

    savedAnswers.forEach(a => {
      if (!a.selected_answer) return;
      if (a.selected_answer === a.question.correct_answer) {
        correct++;
        totalScore += parseFloat(a.question.marks?.toString() || '0');
      } else {
        wrong++;
        totalScore -= parseFloat(a.question.negative_marks?.toString() || '0');
      }
    });

    const unanswered = savedAnswers.filter(a => !a.selected_answer).length;

    totalScore = Math.max(0, totalScore);

    // Update attempt
    await prisma.student_exam_attempts.update({
      where: { attempt_id: parseInt(attemptId) },
      data: {
        status: "completed",
        end_time: new Date(),
        total_time_seconds: totalTimeTaken,
        score: totalScore,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
      },
    });

    return NextResponse.json({
      success: true,
      correct,
      wrong,
      unanswered,
      score: totalScore,
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, message: "Submit failed" },
      { status: 500 }
    );
  }
}