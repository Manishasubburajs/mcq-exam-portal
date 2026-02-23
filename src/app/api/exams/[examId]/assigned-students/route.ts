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
    });

    if (!assignment) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2️⃣ Get all students linked in the join table
    const students = await prisma.exam_assignment_students.findMany({
      where: { assignment_id: assignment.id },
      select: { student_id: true },
    });

    const studentIds = students.map((s) => s.student_id);

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3️⃣ Check for locked attempts
    const lockedAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        exam_id: examId,
        student_id: { in: studentIds },
        status: { in: ["in_progress", "completed"] },
      },
      select: { student_id: true },
    });

    const lockedSet = new Set(lockedAttempts.map((a) => a.student_id));

    // 4️⃣ Build response
    const result = studentIds.map((id) => ({
      student_id: id,
      isLocked: lockedSet.has(id),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Assigned students fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assigned students" },
      { status: 500 },
    );
  }
}
