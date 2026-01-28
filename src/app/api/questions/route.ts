import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ============================
// GET — fetch all questions
// ============================
export async function GET() {
  try {
    const questions = await prisma.questions.findMany({
      include: {
        subject: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        // ✅ Count how many exams this specific question is used in
        const examCount = await prisma.exam_questions.count({
          where: {
            question_id: q.question_id,
          },
        });

        return {
          question_id: q.question_id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          points: q.marks,
          difficulty: q.difficulty,
          subject_id: q.subject_id,
          subject_name: q.subject?.subject_name,
          topic_id: q.topic_id,
          created_at: q.created_at,

          // 🔐 LOCK FLAGS (USED BY FRONTEND)
          examCount,
          canEdit: examCount === 0,
          canDelete: examCount === 0,
        };
      }),
    );

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

// ============================
// POST — add new question
// ============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      points,
      difficulty,
      subject_id,
      topic_id,
    } = body;

    if (!question_text || !correct_answer || !subject_id || !topic_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validAnswers = ["A", "B", "C", "D"];
    if (!validAnswers.includes(correct_answer.toUpperCase())) {
      return NextResponse.json(
        { error: "Correct answer must be A, B, C, or D" },
        { status: 400 },
      );
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    const normalizedDifficulty = validDifficulties.includes(difficulty)
      ? difficulty
      : "Medium";

    const safePoints = typeof points === "number" && points > 0 ? points : 2;

    const subjectExists = await prisma.subjects.findUnique({
      where: { subject_id },
    });
    if (!subjectExists) {
      return NextResponse.json(
        { error: "Invalid subject selected" },
        { status: 400 },
      );
    }

    const topicExists = await prisma.topics.findUnique({
      where: { topic_id },
    });
    if (!topicExists) {
      return NextResponse.json(
        { error: "Invalid topic selected" },
        { status: 400 },
      );
    }

    const newQuestion = await prisma.questions.create({
      data: {
        question_text: question_text.trim(),
        option_a: option_a || null,
        option_b: option_b || null,
        option_c: option_c || null,
        option_d: option_d || null,
        correct_answer: correct_answer.toUpperCase(),
        marks: safePoints,
        difficulty: normalizedDifficulty,
        subject_id,
        topic_id,
      },
    });

    return NextResponse.json({
      message: "Question added successfully",
      question_id: newQuestion.question_id,
    });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to add question" },
      { status: 500 },
    );
  }
}

// ============================
// PUT — update question (LOCKED)
// ============================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      question_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      points,
      difficulty,
      subject_id,
      topic_id,
    } = body;

    if (
      !question_id ||
      !question_text ||
      !correct_answer ||
      !subject_id ||
      !topic_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 🔒 CHECK EXAM USAGE
    const examCount = await prisma.exam_questions.count({
      where: { question_id },
    });

    if (examCount > 0) {
      return NextResponse.json(
        { error: "Cannot edit question. It is already used in an exam." },
        { status: 400 },
      );
    }

    const validAnswers = ["A", "B", "C", "D"];
    if (!validAnswers.includes(correct_answer.toUpperCase())) {
      return NextResponse.json(
        { error: "Correct answer must be A, B, C, or D" },
        { status: 400 },
      );
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    const normalizedDifficulty = validDifficulties.includes(difficulty)
      ? difficulty
      : "Medium";

    const safePoints = typeof points === "number" && points > 0 ? points : 2;

    await prisma.questions.update({
      where: { question_id },
      data: {
        question_text: question_text.trim(),
        option_a: option_a || null,
        option_b: option_b || null,
        option_c: option_c || null,
        option_d: option_d || null,
        correct_answer: correct_answer.toUpperCase(),
        marks: safePoints,
        difficulty: normalizedDifficulty,
        subject_id,
        topic_id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 },
    );
  }
}

// ============================
// DELETE — delete question (LOCKED)
// ============================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    // 🔒 CHECK EXAM USAGE
    const examCount = await prisma.exam_questions.count({
      where: { question_id: id },
    });

    if (examCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete question. It is already used in an exam." },
        { status: 400 },
      );
    }

    await prisma.questions.delete({
      where: { question_id: id },
    });

    return NextResponse.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
