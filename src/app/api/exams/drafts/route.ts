import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject_id = searchParams.get("subject_id");
    const exam_title = searchParams.get("exam_title");

    if (!subject_id) {
      return NextResponse.json({ success: false, message: "Subject ID required" });
    }

    let query = `SELECT * FROM questions WHERE is_draft=1 AND subject_id=?`;
    const params: any[] = [subject_id];

    if (exam_title) {
      query += ` AND exam_id IN (SELECT exam_id FROM exams WHERE exam_title=?)`;
      params.push(exam_title);
    }

    const [rows]: any = await db.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching draft questions:", err);
    return NextResponse.json({ success: false, message: "Error fetching drafts" });
  }
}

// Fetch draft titles for dropdown
export async function HEAD(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject_id = searchParams.get("subject_id");
    if (!subject_id) return NextResponse.json({ success: false, data: [] });

    const [rows]: any = await db.query(
      `SELECT DISTINCT exam_title FROM exams WHERE subject_id=? AND status='draft'`,
      [subject_id]
    );

    // Ensure rows is an array of objects with exam_title
    const titles = Array.isArray(rows) ? rows.map((r: any) => r.exam_title) : [];
    return NextResponse.json(titles);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
