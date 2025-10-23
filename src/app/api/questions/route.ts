import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: fetch all questions with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get("subject") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const search = searchParams.get("search") || "";

    let query = `
      SELECT q.question_id, q.question_text, q.difficulty, s.subject_name,
        (SELECT COUNT(*) 
         FROM exams e 
         JOIN questions q2 ON e.exam_id = q2.exam_id 
         WHERE q2.question_id = q.question_id) AS usedIn
      FROM questions q
      LEFT JOIN subjects s ON q.subject_id = s.subject_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (subject) {
      query += ` AND s.subject_name = ?`;
      params.push(subject);
    }

    if (difficulty) {
      query += ` AND q.difficulty = ?`;
      params.push(difficulty);
    }

    if (search) {
      query += ` AND q.question_text LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY q.question_id DESC`;

    const [questions]: any = await db.query(query, params);

    // Map to frontend expected keys
    const mappedQuestions = questions.map((q: any) => ({
      id: q.question_id,
      question: q.question_text,
      subject: q.subject_name || "N/A",
      difficulty: q.difficulty,
      usedIn: q.usedIn
    }));

    console.log("DB result:", mappedQuestions);

    return NextResponse.json({ success: true, data: mappedQuestions });
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
