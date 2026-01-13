// app/api/students/submit/route.ts
// Purpose: Calculate marks, apply negative marking, close exam

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

const MARK_PER_Q = 2;
const NEGATIVE = 0.66;
const PASS_MARK = 35;

export async function POST(req: Request) {
  try {
    console.log("🟢 Submit exam API called");

    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token || "");

    console.log("👤 Token user:", user);

    if (!user || user.role !== "student") {
      console.log("❌ Unauthorized access");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("📦 Request body:", body);

    const { attemptId, autoSubmitted, totalTimeTaken } = body;

    if (!attemptId) {
      console.log("❌ attemptId missing");
      return NextResponse.json(
        { success: false, message: "Attempt ID missing" },
        { status: 400 }
      );
    }

    /* ================= CHECK ATTEMPT ================= */
    const attempt = await prisma.student_exam_attempts.findUnique({
      where: { attempt_id: attemptId },
      select: { status: true },
    });

    console.log("📝 Exam attempt record:", attempt);

    if (!attempt) {
      console.log("❌ Attempt not found");
      return NextResponse.json(
        { success: false, message: "Invalid attempt" },
        { status: 404 }
      );
    }

    if (attempt.status === "completed") {
      console.log("⚠️ Exam already submitted");
      return NextResponse.json(
        { success: false, message: "Exam already submitted" },
        { status: 409 }
      );
    }

    /* ================= FETCH ANSWERS ================= */
    const answers = await prisma.student_answers.findMany({
      where: { attempt_id: attemptId },
      include: {
        question: {
          select: { correct_answer: true },
        },
      },
    });

    console.log("📄 Answers fetched:", answers.length);

    let correct = 0;
    let wrong = 0;

    for (const a of answers) {
      if (!a.selected_answer) continue;

      if (a.selected_answer === a.question.correct_answer) {
        correct++;
      } else {
        wrong++;
      }
    }

    const unanswered = answers.filter(a => !a.selected_answer).length;

    console.log("📊 Evaluation result:", {
      correct,
      wrong,
      unanswered,
    });

    const score = Math.max(
      0,
      correct * MARK_PER_Q - wrong * NEGATIVE
    );

    const passed = score >= PASS_MARK;

    console.log("🏆 Score calculation:", {
      score,
      passed,
      MARK_PER_Q,
      NEGATIVE,
      PASS_MARK,
    });

    /* ================= UPDATE ATTEMPT ================= */
    const updatedAttempt = await prisma.student_exam_attempts.update({
      where: { attempt_id: attemptId },
      data: {
        status: "completed",
        end_time: new Date(),
        total_time_seconds: totalTimeTaken ?? null,
        score,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
      },
    });

    console.log("✅ Exam attempt updated:", updatedAttempt);

    /* ================= RESPONSE ================= */
    console.log("🎉 Exam submission successful");

    return NextResponse.json({
      success: true,
      autoSubmitted: !!autoSubmitted,
      correct,
      wrong,
      unanswered,
      score,
      passed,
    });

  } catch (error) {
    console.error("🔥 Submit exam error:", error);
    return NextResponse.json(
      { success: false, message: "Submit failed" },
      { status: 500 }
    );
  }
}
