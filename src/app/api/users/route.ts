import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

      const user = await prisma.users.findUnique({
        where: { user_id: decoded.userId },
        include: {
          student_details: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const formattedUser = {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        grade: user.student_details?.[0]?.grade,
        section: user.student_details?.[0]?.section,
      };

      return NextResponse.json({ user: formattedUser });
    } else {
      // Return all users (admin functionality)
      const users = await prisma.users.findMany({
        include: {
          student_details: true,
        },
      });

      const formattedUsers = users.map((user: any) => ({
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        grade: user.student_details?.[0]?.grade,
        section: user.student_details?.[0]?.section,
      }));

      console.log("User Details:", formattedUsers);
      return NextResponse.json({ success: true, data: formattedUsers });
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

    // Delete user (Prisma will handle cascading deletes)
    const deletedUser = await prisma.users.delete({
      where: { user_id: user_id },
    });

    if (deletedUser) {
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

    // Create user with student details if applicable
    const userData: any = {
      username,
      first_name,
      last_name,
      email,
      role: role as any,
      status: status as any,
    };

    if (role === "student" && (grade || section)) {
      userData.student_details = {
        create: {
          grade: grade || null,
          section: section || null,
          dob: null,
          gender: "male",
          school: "",
        },
      };
    }

    const newUser = await prisma.users.create({
      data: userData,
      include: {
        student_details: true,
      },
    });

    const formattedUser = {
      user_id: newUser.user_id,
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      grade: newUser.student_details?.[0]?.grade,
      section: newUser.student_details?.[0]?.section,
    };

    return NextResponse.json({ success: true, user: formattedUser });
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
      await prisma.users.update({
        where: { user_id: user_id },
        data: {
          first_name,
          last_name,
          email,
        },
      });
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
      const updateData: any = {
        username,
        first_name,
        last_name,
        email,
        role: role as any,
        status: status as any,
      };

      // 2️⃣ Handle student details
      if (role === "student") {
        updateData.student_details = {
          upsert: {
            create: {
              grade: grade || null,
              section: section || null,
            },
            update: {
              grade: grade || null,
              section: section || null,
            },
          },
        };
      } else {
        // If not a student, disconnect student_details
        updateData.student_details = {
          delete: true,
        };
      }

      await prisma.users.update({
        where: { user_id: user_id },
        data: updateData,
      });
    }

    // 3️⃣ Fetch updated user
    const updatedUser = await prisma.users.findUnique({
      where: { user_id: user_id },
      include: {
        student_details: true,
      },
    });

    const formattedUser = {
      user_id: updatedUser?.user_id,
      username: updatedUser?.username,
      first_name: updatedUser?.first_name,
      last_name: updatedUser?.last_name,
      email: updatedUser?.email,
      role: updatedUser?.role,
      status: updatedUser?.status,
      grade: updatedUser?.student_details?.[0]?.grade,
      section: updatedUser?.student_details?.[0]?.section,
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (error) {
    console.error("Error updating user:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
