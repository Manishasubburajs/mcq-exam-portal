import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================
// GET ALL USERS
// ============================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        s.grade,
        s.section
      FROM users u
      LEFT JOIN student_details s ON u.user_id = s.user_id
    `);

    console.log("User Details:", rows);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
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
// UPDATE USER
// ============================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, username, first_name, last_name, email, role, grade, section, status } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required for update." },
        { status: 400 }
      );
    }

    // 1️⃣ Update users table
    await db.query(
      `UPDATE users 
       SET username = ?, first_name = ?, last_name = ?, email = ?, role = ?, status = ? 
       WHERE user_id = ?`,
      [username, first_name, last_name, email, role, status, user_id]
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
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
