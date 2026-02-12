import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = decoded.userId;
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json(
        { success: false, message: "Attempt ID required" },
        { status: 400 }
      );
    }

    const parsedAttemptId = Number(attemptId);
    if (isNaN(parsedAttemptId)) {
      return NextResponse.json(
        { success: false, message: "Invalid attempt ID" },
        { status: 400 }
      );
    }

    // Verify the attempt belongs to the student and is completed
    const originalAttempt = await prisma.student_exam_attempts.findFirst({
      where: {
        attempt_id: parsedAttemptId,
        student_id: studentId,
        status: "completed",
      },
    });

    if (!originalAttempt) {
      return NextResponse.json(
        { success: false, message: "Attempt not found or not completed" },
        { status: 404 }
      );
    }

    // Get existing attempt count for this exam and student
    const existingAttempts = await prisma.student_exam_attempts.count({
      where: {
        student_id: studentId,
        exam_id: originalAttempt.exam_id
      }
    });

    const attemptNumber = existingAttempts + 1;

    // Create new attempt
    const newAttempt = await prisma.student_exam_attempts.create({
      data: {
        student_id: studentId,
        exam_id: originalAttempt.exam_id,
        attempt_number: attemptNumber,
        status: "in_progress",
        start_time: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Exam retake created",
      attemptId: newAttempt.attempt_id
    });
  } catch (error) {
    console.error("Error creating retake:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create retake" },
      { status: 500 }
    );
  }
}