import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;

    // Fetch exam
    const [examRows]: any = await db.query(
      `SELECT * FROM exams WHERE exam_id=?`,
      [examId]
    );

    if (!examRows || examRows.length === 0) {
      return NextResponse.json({ success: false, message: "Exam not found" });
    }

    const exam = examRows[0];

    // Fetch related questions
    const [questionRows]: any = await db.query(
      `SELECT * FROM questions WHERE exam_id=? ORDER BY question_id ASC`,
      [examId]
    );

    exam.questions = questionRows || [];
    exam.question_count = questionRows.length || 0;

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("❌ Error fetching exam:", error);
    return NextResponse.json({ success: false, message: "Error fetching exam" });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;

    // 1️⃣ Delete all related questions
    await db.query(`DELETE FROM questions WHERE exam_id = ?`, [examId]);

    // 2️⃣ Delete the exam itself
    await db.query(`DELETE FROM exams WHERE exam_id = ?`, [examId]);

    return NextResponse.json({ success: true, message: "Draft exam deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting draft:", error);
    return NextResponse.json({ success: false, message: "Error deleting draft" });
  }
}
