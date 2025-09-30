// app/api/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const conn = await pool.getConnection();

    try {
      // Check if user exists
      const [rows]: any = await conn.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      conn.release();

      if (rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = rows[0];

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }

      // Log user credentials (safe, no password)
      console.log("User login:", {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      });

      // Generate JWT token, expires in 1 hour
      const token = jwt.sign(
        { userId: user.user_id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" } // token valid for 1 hour from now
      );

      // Return success response
      return NextResponse.json({
        message: "Login successful",
        role: user.role,
        token,
      });
    } catch (err) {
      conn.release();
      console.error("DB Error:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
