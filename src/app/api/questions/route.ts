import { NextResponse } from "next/server";
import {db} from "@/lib/db";

// ✅ GET — fetch all questions
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT q.*, s.subject_name 
       FROM questions q 
       LEFT JOIN subjects s ON q.subject_id = s.subject_id 
       ORDER BY q.created_at DESC`
    );
    return NextResponse.json(rows);
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
    const draftFlag = is_draft ? 1 : 0;

    // ✅ Ensure subject exists
    const [subjectCheck]: any = await db.query(
      "SELECT subject_id FROM subjects WHERE subject_id = ?",
      [subject_id]
    );
    if (subjectCheck.length === 0) {
      return NextResponse.json(
        { error: "Invalid subject selected" },
        { status: 400 }
      );
    }

    // ✅ Insert safe question data
    const [result]: any = await db.query(
      `INSERT INTO questions 
       (question_text, option_a, option_b, option_c, option_d, correct_answer, points, difficulty, subject_id, is_draft)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question_text.trim(),
        option_a?.trim() || "",
        option_b?.trim() || "",
        option_c?.trim() || "",
        option_d?.trim() || "",
        correct_answer.trim(),
        safePoints,
        normalizedDifficulty,
        subject_id,
        draftFlag,
      ]
    );

    return NextResponse.json({
      message: "Question added successfully",
      question_id: result.insertId,
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

    await db.query("DELETE FROM questions WHERE question_id = ?", [id]);
    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/questions error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
