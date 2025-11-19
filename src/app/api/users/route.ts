import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import * as Yup from "yup";

// ------------------------------------------
// YUP VALIDATION SCHEMAS
// ------------------------------------------
const studentSchema = Yup.object({
  dob: Yup.string().required("DOB is required for students"),
  gender: Yup.string().required("Gender is required for students"),
  school: Yup.string().required("School is required for students"),
  grade: Yup.string().required("Grade is required for students"),
  section: Yup.string().required("Section is required for students"),
});

const userSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password_hash: Yup.string().required("Password is required"),
  role: Yup.string().oneOf(["student", "teacher", "admin"]).required(),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  department: Yup.string().nullable(),
  dob: Yup.string().nullable(),
  gender: Yup.string().nullable(),
  school: Yup.string().nullable(),
  grade: Yup.string().nullable(),
  section: Yup.string().nullable(),
});

// ------------------------------------------
// GET USERS
// ------------------------------------------
export async function GET(req: Request) {
  console.log("🔥 /api/users GET called");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (userId) {
      const user = await prisma.users.findUnique({
        where: { user_id: Number(userId) },
        include: { student_details: true },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: user }, { status: 200 });
    }

    const users = await prisma.users.findMany({
      include: { student_details: true },
      orderBy: { user_id: "desc" },
    });

    console.log("🔥 Users fetched:", users.length);

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching users" },
      { status: 500 }
    );
  }
}

// ------------------------------------------
// CREATE USER
// ------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate base user fields
    await userSchema.validate(body, { abortEarly: false });

    if (body.role === "student") {
      await studentSchema.validate(body, { abortEarly: false });
    }

    const {
      username,
      email,
      password_hash,
      role,
      first_name,
      last_name,
      department,
      dob,
      gender,
      school,
      grade,
      section,
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          username,
          email,
          password_hash,
          role,
          first_name,
          last_name,
          department,
        },
      });

      if (role === "student") {
        await tx.student_details.create({
          data: {
            user_id: user.user_id,
            dob,
            gender,
            school,
            grade,
            section,
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/users error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, validationErrors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error creating user" },
      { status: 500 }
    );
  }
}

// ------------------------------------------
// UPDATE USER
// ------------------------------------------
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Validate base fields
    await userSchema.validate(body, { abortEarly: false });

    if (body.role === "student") {
      await studentSchema.validate(body, { abortEarly: false });
    }

    const {
      user_id,
      username,
      email,
      password_hash,
      role,
      first_name,
      last_name,
      department,
      dob,
      gender,
      school,
      grade,
      section,
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.users.update({
        where: { user_id },
        data: {
          username,
          email,
          password_hash,
          role,
          first_name,
          last_name,
          department,
        },
      });

      if (role === "student") {
        const exists = await tx.student_details.findUnique({
          where: { user_id },
        });

        if (exists) {
          await tx.student_details.update({
            where: { user_id },
            data: { dob, gender, school, grade, section },
          });
        } else {
          await tx.student_details.create({
            data: { user_id, dob, gender, school, grade, section },
          });
        }
      }

      return updatedUser;
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ PUT /api/users error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, validationErrors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error updating user" },
      { status: 500 }
    );
  }
}

// ------------------------------------------
// DELETE USER
// ------------------------------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.users.delete({
      where: { user_id: Number(userId) },
    });

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting user" },
      { status: 500 }
    );
  }
}
