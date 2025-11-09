// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST, // e.g. "localhost"
  user: process.env.DB_USER, // your db user
  password: process.env.DB_PASSWORD, // your db password
  database: process.env.DB_NAME, // e.g. "mcq_portal"
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      dob,
      gender,
      school,
      grade,
      section,
    } = body;
    const trimmedEmail = email.trim();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert into users table (store email in lowercase for consistency)
      const [userResult]: any = await conn.execute(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name)
         VALUES (?, ?, ?, 'student', ?, ?)`,
        [username, trimmedEmail.toLowerCase(), hashedPassword, firstName, lastName]
      );

      const userId = userResult.insertId;

      // Insert into student_details table
      await conn.execute(
        `INSERT INTO student_details (user_id, dob, gender, school, grade, section)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, dob, gender, school, grade, section]
      );

      await conn.commit();
      conn.release();

      return NextResponse.json(
        { message: "User registered successfully", userId },
        { status: 201 }
      );
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error("DB Error:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
