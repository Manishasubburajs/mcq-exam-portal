// 📁 src/app/api/subjects/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT subject_id, subject_name FROM subjects ORDER BY subject_name ASC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load subjects" },
      { status: 500 }
    );
  }
}
