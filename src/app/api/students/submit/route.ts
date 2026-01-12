// app/api/students/exams/submit/route.ts

//Purpose //Calculate marks //Apply negative marking //Close exam

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

const MARK_PER_Q = 2;
const NEGATIVE = 0.66;
const PASS_MARK = 35;

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token || "");

    if (!user || user.role !== "student") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { attemptId } = await req.json();

    // Fetch answers with question
    const answers = await prisma.student_answers.findMany({
      where: { attempt_id: attemptId },
      include: {
        question: {
          select: { correct_answer: true }
        }
      }
    });

    let correct = 0;
    let wrong = 0;

    answers.forEach(a => {
      if (!a.selected_answer) return;
      if (a.selected_answer === a.question.correct_answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const unanswered = answers.filter(a => !a.selected_answer).length;

    const score = Math.max(
      0,
      correct * MARK_PER_Q - wrong * NEGATIVE
    );

    const passed = score >= PASS_MARK;

    await prisma.student_exam_attempts.update({
      where: { attempt_id: attemptId },
      data: {
        status: "completed",
        end_time: new Date(),
        score,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered
      }
    });

    return NextResponse.json({
      success: true,
      correct,
      wrong,
      unanswered,
      score,
      passed
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, message: "Submit failed" },
      { status: 500 }
    );
  }
}
