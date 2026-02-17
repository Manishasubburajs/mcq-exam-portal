import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } },
) {
  try {
    const examId = Number(params.examId);
    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Invalid examId" },
        { status: 400 },
      );
    }

    // 1️⃣ Find assignment
    const assignment = await prisma.exam_assignments.findFirst({
      where: { exam_id: examId },
      include: {
        students: {
          select: { student_id: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ success: true, data: [] });
    }

    const studentIds = assignment.students.map((s) => s.student_id);

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2️⃣ Find students who are in_progress or completed
    const lockedAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        exam_id: examId,
        student_id: { in: studentIds },
        status: {
          in: ["in_progress", "completed"], // 🔥 block both
        },
      },
      select: { student_id: true, status: true },
    });

    const lockedSet = new Set(lockedAttempts.map((a) => a.student_id));

    // 3️⃣ Build response with lock info
    const result = studentIds.map((id) => ({
      student_id: id,
      isLocked: lockedSet.has(id),
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Assigned students fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assigned students" },
      { status: 500 },
    );
  }
}
