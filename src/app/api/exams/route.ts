import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // MySQL connection

// ========================
// ✅ CREATE EXAM (POST)
// ========================
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      exam_title,
      description,
      subject_id,
      time_limit_minutes,
      total_marks,
      scheduled_start,
      scheduled_end,
      created_by,
      status,
      questions,
    } = data;

    // 🧩 0️⃣ Check duplicate exam title within same subject
    const [existing] = await db.query(
      `SELECT exam_id FROM exams WHERE subject_id = ? AND exam_title = ?`,
      [subject_id, exam_title]
    );

    if ((existing as any).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam title already exists for this subject!",
        },
        { status: 400 }
      );
    }

    // 🧩 1️⃣ Insert exam record
    const [examResult] = await db.query(
      `INSERT INTO exams 
        (exam_title, description, subject_id, time_limit_minutes, total_marks, scheduled_start, scheduled_end, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exam_title,
        description,
        subject_id,
        time_limit_minutes,
        total_marks,
        scheduled_start,
        scheduled_end,
        created_by,
        status,
      ]
    );

    const exam_id = (examResult as any).insertId;

    // 🧩 2️⃣ Insert related questions
    if (questions && questions.length > 0) {
      const questionValues = questions.map((q: any) => {
        // Ensure correct_answer is one of A/B/C/D
        const validAnswers = ["A", "B", "C", "D"];
        if (!validAnswers.includes(q.correct_answer)) {
          throw new Error(
            `Invalid correct answer: ${q.correct_answer}. Must be A/B/C/D.`
          );
        }

        return [
          exam_id,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer, // store letter only
          q.points || 1,
          q.difficulty || "Medium",
          subject_id,
          created_by,
          status === "draft" ? 1 : 0,
        ];
      });

      await db.query(
        `INSERT INTO questions
          (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, difficulty, subject_id, created_by, is_draft)
         VALUES ?`,
        [questionValues]
      );
    }

    return NextResponse.json({ success: true, exam_id });
  } catch (err) {
    console.error("❌ Error saving exam:", err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}

// ========================
// ✅ GET DRAFT EXAMS (GET)
// ========================
export async function GET() {
  try {
    const [drafts]: any = await db.query(
      `SELECT e.exam_id, e.exam_title, e.subject_id,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.exam_id) AS question_count
       FROM exams e
       WHERE e.status='draft'
       ORDER BY e.created_at DESC`
    );

    return NextResponse.json(drafts);
  } catch (err) {
    console.error("❌ Error fetching drafts:", err);
    return NextResponse.json({
      success: false,
      error: "Error fetching drafts",
    });
  }
}
