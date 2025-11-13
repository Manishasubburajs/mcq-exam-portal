import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ✅ GET — fetch all questions
export async function GET() {
  try {
    const questions = await prisma.questions.findMany({
      include: {
        subjects: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedQuestions = questions.map((q:any) => ({
      question_id: q.question_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      points: q.points,
      difficulty: q.difficulty,
      subject_name: q.subjects?.subject_name,
      subject_id: q.subject_id,
      created_at: q.created_at,
      is_draft: q.is_draft,
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error: any) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// ✅ POST — add a new question
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
      is_draft,
    } = body;

    // ✅ Validate required fields
    if (!question_text || !correct_answer || !subject_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Normalize difficulty (MySQL ENUM is case-sensitive)
    const validDifficulties = ["Easy", "Medium", "Hard"];
    const normalizedDifficulty =
      validDifficulties.includes(difficulty) ? difficulty : "Medium";

    // ✅ Normalize points — must be positive integer
    const safePoints =
      typeof points === "number" && points > 0 ? points : 1;

    // ✅ Normalize draft flag — always 0 or 1
    const draftFlag = is_draft ? true : false;

    // ✅ Ensure subject exists
    const subjectExists = await prisma.subjects.findUnique({
      where: { subject_id: subject_id },
    });
    if (!subjectExists) {
      return NextResponse.json(
        { error: "Invalid subject selected" },
        { status: 400 }
      );
    }

    // ✅ Insert safe question data
    const newQuestion = await prisma.questions.create({
      data: {
        question_text: question_text.trim(),
        option_a: option_a?.trim() || "",
        option_b: option_b?.trim() || "",
        option_c: option_c?.trim() || "",
        option_d: option_d?.trim() || "",
        correct_answer: correct_answer.trim(),
        points: safePoints,
        difficulty: normalizedDifficulty as any,
        subject_id: subject_id,
        is_draft: draftFlag,
      },
    });

    return NextResponse.json({
      message: "Question added successfully",
      question_id: newQuestion.question_id,
    });
  } catch (error: any) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json(
      { error: "Failed to add question", details: error.message },
      { status: 500 }
    );
  }
}


// ✅ DELETE — delete question
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing question ID" }, { status: 400 });
    }

    await prisma.questions.delete({
      where: { question_id: id },
    });
    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/questions error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
