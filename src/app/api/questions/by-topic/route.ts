import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = Number(searchParams.get("topicId"));

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 },
      );
    }

    const questions = await prisma.questions.findMany({
      where: { topic_id: topicId },
      select: {
        question_id: true,
        question_text: true,
        option_a: true,
        option_b: true,
        option_c: true,
        option_d: true,
        correct_answer: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("GET by-topic error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}
