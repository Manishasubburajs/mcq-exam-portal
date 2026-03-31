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
      mobile,
      dob,
      gender,
    } = body;

    // Basic validation
    if (
      !email ||
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !mobile ||
      !dob ||
      !gender
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    // Check if email already exists
    const emailExists = await prisma.users.findUnique({
      where: { email: trimmedEmail },
    });

    // Check if username already exists
    const usernameExists = await prisma.users.findUnique({
      where: { username: trimmedUsername },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const mobileExists = await prisma.users.findFirst({
      where: { mobile_number: mobile },
    });

    if (mobileExists) {
      return NextResponse.json(
        { error: "Mobile number already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with student details
    const newUser = await prisma.users.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password_hash: hashedPassword,
        role: "student",
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        mobile_number: mobile ? mobile.trim() : null,
        student_details: {
          create: {
            dob: new Date(dob),
            gender,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Registration successful!", userId: newUser.user_id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
