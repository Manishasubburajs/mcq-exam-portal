// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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

    // Create user with student details in a transaction
    const newUser = await prisma.users.create({
      data: {
        username,
        email: trimmedEmail.toLowerCase(),
        password_hash: hashedPassword,
        role: "student",
        first_name: firstName,
        last_name: lastName,
        student_details: {
          create: {
            dob: new Date(dob),
            gender: gender as any,
            school,
            grade,
            section,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.user_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
