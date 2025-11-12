import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================
// GET CURRENT USER
// ============================
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log('Decoded userId:', decoded.userId);
    console.log('Query parameters:', [decoded.userId]);

    const conn = await db.getConnection();

    try {
      // First check if user exists
      const [userCheck] = await conn.query('SELECT user_id FROM users WHERE user_id = ?', [decoded.userId]);
      console.log('User check result:', userCheck);

      if ((userCheck as any[]).length === 0) {
        console.log('User not found in users table');
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const [rows] = await conn.query(`
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        s.grade,
        s.section,
        s.dob,
        s.gender,
        s.school
      FROM users u
      LEFT JOIN student_details s ON u.user_id = s.user_id
      WHERE u.user_id = ?
    `, [decoded.userId]);

    console.log('Query result:', rows);
    console.log('Rows length:', (rows as any[]).length);

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: (rows as any[])[0] });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    console.error("Full error:", error);
    console.error("Error stack:", (error as Error).stack);
    console.error("Error name:", (error as Error).name);
    console.error("Error code:", (error as any).code);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================
// UPDATE CURRENT USER
// ============================
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const user_id = decoded.userId;

    const body = await request.json();
    const { first_name, last_name, email, school, grade, section, dob, gender } = body;

    const conn = await db.getConnection();

    try {
      // Update current user data
      await conn.query(
        `UPDATE users
          SET first_name = ?, last_name = ?, email = ?
          WHERE user_id = ?`,
        [first_name, last_name, email, user_id]
      );

      // Update or insert student details
      const [existingStudent] = await conn.query('SELECT user_id FROM student_details WHERE user_id = ?', [user_id]);
      if ((existingStudent as any[]).length > 0) {
        await conn.query(
          'UPDATE student_details SET dob = ?, gender = ?, school = ?, grade = ?, section = ? WHERE user_id = ?',
          [dob, gender, school, grade, section, user_id]
        );
      } else {
        await conn.query(
          'INSERT INTO student_details (user_id, dob, gender, school, grade, section) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, dob, gender, school, grade, section]
        );
      }

      // Fetch updated user
      const [updatedRows] = await conn.query(
        `
        SELECT
          u.user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          s.grade,
          s.section,
          s.dob,
          s.gender,
          s.school
        FROM users u
        LEFT JOIN student_details s ON u.user_id = s.user_id
        WHERE u.user_id = ?
      `,
        [user_id]
      );

      return NextResponse.json({ success: true, user: (updatedRows as any)[0] });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error updating user:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}