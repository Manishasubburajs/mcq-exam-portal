import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      exam_id,
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

    let examId = exam_id;

    // 1️⃣ Insert new exam if exam_id not present
    if (!exam_id) {
      const [result]: any = await db.query(
        `INSERT INTO exams 
        (exam_title, description, subject_id, time_limit_minutes, total_marks, scheduled_start, scheduled_end, status, created_by, question_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exam_title,
          description,
          subject_id,
          time_limit_minutes,
          total_marks,
          scheduled_start,
          scheduled_end,
          status,
          created_by,
          questions.length,
        ]
      );
      examId = result.insertId;
    } else {
      // 2️⃣ Update existing exam
      await db.query(
        `UPDATE exams SET exam_title=?, description=?, subject_id=?, time_limit_minutes=?, total_marks=?, scheduled_start=?, scheduled_end=?, status=?, question_count=? WHERE exam_id=?`,
        [
          exam_title,
          description,
          subject_id,
          time_limit_minutes,
          total_marks,
          scheduled_start,
          scheduled_end,
          status,
          questions.length,
          exam_id,
        ]
      );

      // Optionally, remove old questions if exam is being republished
      await db.query(`DELETE FROM questions WHERE exam_id=?`, [exam_id]);
    }

    // 3️⃣ Insert questions
    if (questions && questions.length > 0) {
      const values = questions.map((q: any) => [
        examId,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.points,
        q.difficulty,
        subject_id,
        created_by,
        q.is_draft ? 1 : 0,
      ]);
      await db.query(
        `INSERT INTO questions 
        (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, difficulty, subject_id, created_by, is_draft) 
        VALUES ?`,
        [values]
      );
    }

    return NextResponse.json({ success: true, exam_id: examId });
  } catch (error) {
    console.error("Error saving exam:", error);
    return NextResponse.json({ success: false, message: "Error saving exam" });
  }
}
