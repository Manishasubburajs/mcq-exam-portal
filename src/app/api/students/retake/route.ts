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

    // Verify the attempt belongs to the student and is completed
    const attempt = await prisma.student_exam_attempts.findFirst({
      where: {
        attempt_id: attemptId,
        student_id: studentId,
        status: "completed",
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, message: "Attempt not found or not completed" },
        { status: 404 }
      );
    }

    // Update status to expired so it's not counted as completed
    await prisma.student_exam_attempts.update({
      where: { attempt_id: attemptId },
      data: { status: "expired" },
    });

    return NextResponse.json({ success: true, message: "Exam retake enabled" });
  } catch (error) {
    console.error("Error enabling retake:", error);
    return NextResponse.json(
      { success: false, message: "Failed to enable retake" },
      { status: 500 }
    );
  }
}