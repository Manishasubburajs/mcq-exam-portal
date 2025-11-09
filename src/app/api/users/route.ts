import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================
// GET ALL USERS OR CURRENT USER
// ============================
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // Return current user data
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      let decoded: { userId: number; role: string };
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
      } catch (error) {
        console.error("JWT verification failed:", (error as Error).message);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const [rows] = await db.query(`
        SELECT
          u.user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.status,
          u.phone,
          u.birth_date,
          u.gender,
          u.bio,
          s.grade,
          s.section
        FROM users u
        LEFT JOIN student_details s ON u.user_id = s.user_id
        WHERE u.user_id = ?
      `, [decoded.userId]);

      if ((rows as any[]).length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: (rows as any[])[0] });
    } else {
      // Return all users (admin functionality)
      const [rows] = await db.query(`
        SELECT
          u.user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.status,
          u.phone,
          u.birth_date,
          u.gender,
          u.bio,
          s.grade,
          s.section
        FROM users u
        LEFT JOIN student_details s ON u.user_id = s.user_id
      `);

      console.log("User Details:", rows);
      return NextResponse.json({ success: true, data: rows });
    }
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// ============================
// DELETE USER
// ============================
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    // Delete from student_details first
    await db.query("DELETE FROM student_details WHERE user_id = ?", [user_id]);

    // Delete from users
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [user_id]);

    if ((result as any).affectedRows > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting user:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================
// ADD NEW USER
// ============================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, first_name, last_name, email, role, grade, section, status } = body;

    if (!username || !first_name || !email) {
      return NextResponse.json(
        { success: false, error: "Username, First name, and Email are required." },
        { status: 400 }
      );
    }

    // Insert into users table (added username field)
    const [userResult] = await db.query(
      "INSERT INTO users (username, first_name, last_name, email, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, role, status]
    );

    const userId = (userResult as any).insertId;

    // If student, insert into student_details
    if (role === "student" && (grade || section)) {
      await db.query(
        "INSERT INTO student_details (user_id, grade, section) VALUES (?, ?, ?)",
        [userId, grade || null, section || null]
      );
    }

    // Fetch newly created user
    const [newUserRows] = await db.query(
      `
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        u.phone,
        u.birth_date,
        u.gender,
        u.bio,
        s.grade,
        s.section
      FROM users u
      LEFT JOIN student_details s ON u.user_id = s.user_id
      WHERE u.user_id = ?
    `,
      [userId]
    );

    return NextResponse.json({ success: true, user: (newUserRows as any)[0] });
  } catch (error) {
    console.error("Error adding user:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================
// UPDATE USER OR CURRENT USER
// ============================
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let user_id: number;

    if (authHeader?.startsWith('Bearer ')) {
      // Update current user
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      let decoded: { userId: number; role: string };
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number; role: string };
      } catch (error) {
        console.error("JWT verification failed:", (error as Error).message);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      user_id = decoded.userId;

      const body = await request.json();
      const { first_name, last_name, email, phone, birth_date, gender, bio } = body;

      // Update current user data
      await db.query(
        `UPDATE users
          SET first_name = ?, last_name = ?, email = ?, phone = ?, birth_date = ?, gender = ?, bio = ?
          WHERE user_id = ?`,
        [first_name, last_name, email, phone, birth_date, gender, bio, user_id]
      );
    } else {
      // Admin update (existing logic)
      const body = await request.json();
      const { user_id: adminUserId, username, first_name, last_name, email, role, grade, section, status, phone, birth_date, gender, bio } = body;

      if (!adminUserId) {
        return NextResponse.json(
          { success: false, error: "User ID is required for update." },
          { status: 400 }
        );
      }

      user_id = adminUserId;

      // 1️⃣ Update users table
      await db.query(
        `UPDATE users
          SET username = ?, first_name = ?, last_name = ?, email = ?, role = ?, status = ?, phone = ?, birth_date = ?, gender = ?, bio = ?
          WHERE user_id = ?`,
        [username, first_name, last_name, email, role, status, phone, birth_date, gender, bio, user_id]
      );

      // 2️⃣ Handle student details
      if (role === "student") {
        const [existing] = await db.query(
          "SELECT * FROM student_details WHERE user_id = ?",
          [user_id]
        );

        if ((existing as any[]).length > 0) {
          await db.query(
            "UPDATE student_details SET grade = ?, section = ? WHERE user_id = ?",
            [grade || null, section || null, user_id]
          );
        } else {
          await db.query(
            "INSERT INTO student_details (user_id, grade, section) VALUES (?, ?, ?)",
            [user_id, grade || null, section || null]
          );
        }
      } else {
        // If not a student, remove any old student_details record
        await db.query("DELETE FROM student_details WHERE user_id = ?", [user_id]);
      }
    }

    // 3️⃣ Fetch updated user
    const [updatedRows] = await db.query(
      `
      SELECT
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        u.phone,
        u.birth_date,
        u.gender,
        u.bio,
        s.grade,
        s.section
      FROM users u
      LEFT JOIN student_details s ON u.user_id = s.user_id
      WHERE u.user_id = ?
    `,
      [user_id]
    );

    return NextResponse.json({ success: true, user: (updatedRows as any)[0] });
  } catch (error) {
    console.error("Error updating user:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
