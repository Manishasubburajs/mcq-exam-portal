import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions provided" },
        { status: 400 }
      );
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    const validAnswers = ["A", "B", "C", "D"];

    const errors: string[] = [];
    const normalizedQuestions: any[] = [];

    // 🔹 Collect subject & topic IDs (OPTIMIZED)
    const subjectIds = [...new Set(questions.map((q) => q.subject_id))];
    const topicIds = [...new Set(questions.map((q) => q.topic_id))];

    const subjects = await prisma.subjects.findMany({
      where: { subject_id: { in: subjectIds } },
      select: { subject_id: true },
    });

    const topics = await prisma.topics.findMany({
      where: { topic_id: { in: topicIds } },
      select: { topic_id: true },
    });

    const subjectSet = new Set(subjects.map((s) => s.subject_id));
    const topicSet = new Set(topics.map((t) => t.topic_id));

    // 🔹 Validate each question
    questions.forEach((q, index) => {
      const row = index + 1;

      if (
        !q.question_text ||
        !q.correct_answer ||
        !q.subject_id ||
        !q.topic_id
      ) {
        errors.push(`Row ${row}: Missing required fields`);
        return;
      }

      if (!validAnswers.includes(q.correct_answer.toUpperCase())) {
        errors.push(
          `Row ${row}: Correct answer must be A, B, C, or D`
        );
        return;
      }

      if (!subjectSet.has(q.subject_id)) {
        errors.push(`Row ${row}: Invalid subject`);
        return;
      }

      if (!topicSet.has(q.topic_id)) {
        errors.push(`Row ${row}: Invalid topic`);
        return;
      }

      const difficulty = validDifficulties.includes(q.difficulty)
        ? q.difficulty
        : "Medium";

      const points =
        typeof q.points === "number" && q.points > 0 ? q.points : 1;

      normalizedQuestions.push({
        question_text: q.question_text.trim(),
        option_a: q.option_a?.trim() || "",
        option_b: q.option_b?.trim() || "",
        option_c: q.option_c?.trim() || "",
        option_d: q.option_d?.trim() || "",
        correct_answer: q.correct_answer.trim().toUpperCase(),
        marks: points, // ✅ DB column
        difficulty: difficulty as any,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
      });
    });

    if (normalizedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid questions to upload",
          validation_errors: errors,
        },
        { status: 400 }
      );
    }

    // 🔹 Bulk insert (FAST)
    await prisma.questions.createMany({
      data: normalizedQuestions,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${normalizedQuestions.length} questions`,
      count: normalizedQuestions.length,
      validation_errors: errors.length ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload questions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
