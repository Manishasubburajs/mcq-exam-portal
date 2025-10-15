import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: fetch all questions for an exam
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exam_id = searchParams.get("exam_id");
    if (!exam_id) return NextResponse.json({ success: false, data: [] });

    const [questions] = await db.query(`SELECT * FROM questions WHERE exam_id=?`, [exam_id]);
    return NextResponse.json({ success: true, data: questions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Error fetching questions" });
  }
}

// DELETE: remove a question
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const question_id = searchParams.get("question_id");
    if (!question_id) return NextResponse.json({ success: false });

    await db.query(`DELETE FROM questions WHERE question_id=?`, [question_id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
