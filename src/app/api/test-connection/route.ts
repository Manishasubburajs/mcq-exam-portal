import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    // Also check if users table exists and has data
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");
    return NextResponse.json({
      success: true,
      data: rows,
      userCount: (userCount as any)[0].count
    });
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
