// app/api/students/answer/route.ts

import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1];
    const user = verifyToken(token || "");

    if (!user || user.role !== "student") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { attemptId, questionId, selectedOption, timeTaken } =
      await req.json();

    await prisma.student_answers.upsert({
      where: {
        attempt_id_question_id: {
          attempt_id: attemptId,
          question_id: questionId,
        },
      },
      update: {
        selected_answer: selectedOption,
        time_taken_seconds: timeTaken,
      },
      create: {
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer: selectedOption,
        time_taken_seconds: timeTaken,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save answer" },
      { status: 500 }
    );
  }
}
