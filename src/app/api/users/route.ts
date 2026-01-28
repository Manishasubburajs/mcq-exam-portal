import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import * as Yup from "yup";
import bcrypt from "bcryptjs";

// ------------------------------------------
// YUP VALIDATION SCHEMAS
// ------------------------------------------
const studentSchema = Yup.object({
  dob: Yup.string().nullable(),
  gender: Yup.string().nullable(),
  school: Yup.string().nullable(),
  grade: Yup.string().nullable(),
  section: Yup.string().nullable(),
});

// Separate schemas for create and update operations
const createUserSchema = Yup.object({
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

const updateUserSchema = Yup.object({
  user_id: Yup.number().required("User ID is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  role: Yup.string().oneOf(["student", "teacher", "admin"]).required(),
  status: Yup.string().oneOf(["active", "inactive", "pending"]).required(),
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
    await createUserSchema.validate(body, { abortEarly: false });

    // Student validation already handled in updateUserSchema

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password_hash, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          role,
          first_name,
          last_name,
         
        },
      });

      if (role === "student") {
        // Ensure dob is always valid (required field)
        if (!dob || dob.trim() === "") {
          throw new Error("Date of birth is required for students");
        }
        
        // Convert YYYY-MM-DD to Date object for Prisma DateTime field
        const formattedDob = new Date(dob);
        
        // Validate that the date conversion worked
        if (isNaN(formattedDob.getTime())) {
          throw new Error("Invalid date format for date of birth");
        }
        
        await tx.student_details.create({
          data: {
            user_id: user.user_id,
            dob: formattedDob,
            gender: gender as any, // Type assertion for enum
            school: school || "",
            grade: grade || "",
            section: section || null,
          },
        });
      }

      // Return complete user data with student_details to match GET response structure
      const userWithDetails = await tx.users.findUnique({
        where: { user_id: user.user_id },
        include: { student_details: true },
      });

      return userWithDetails;
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

    // ✅ Prisma unique constraint error
    if (error.code === "P2002") {
      const target = error.meta?.target;

      let message = "Already exists";

      if (Array.isArray(target)) {
        if (target.includes("username")) {
          message = "Username already exists";
        } else if (target.includes("email")) {
          message = "Email already exists";
        }
      } else if (typeof target === "string") {
        if (target.includes("username")) {
          message = "Username already exists";
        } else if (target.includes("email")) {
          message = "Email already exists";
        }
      }
        return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
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

    // Validate base fields for update
    await updateUserSchema.validate(body, { abortEarly: false });

    // Student validation already handled in updateUserSchema

    const {
      user_id,
      username,
      email,
      role,
      status,
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
          role,
          first_name,
          last_name,
          status,
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

      // Return complete user data with student_details
      const userWithDetails = await tx.users.findUnique({
        where: { user_id },
        include: { student_details: true },
      });

      return userWithDetails;
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
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // First delete associated student_details if they exist
      await tx.student_details.deleteMany({
        where: { user_id: Number(user_id) },
      });

      // Then delete the user
      await tx.users.delete({
        where: { user_id: Number(user_id) },
      });
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

