import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = Number(params.examId);
    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Invalid examId" },
        { status: 400 }
      );
    }

    // One assignment per exam
    const assignment = await prisma.exam_assignments.findFirst({
      where: { exam_id: examId },
    });

    if (!assignment) {
      return NextResponse.json({ success: true, data: [] });
    }

    const students = await prisma.exam_assignment_students.findMany({
      where: { assignment_id: assignment.id },
      select: { student_id: true },
    });

    return NextResponse.json({
      success: true,
      data: students.map(s => s.student_id),
    });
  } catch (error) {
    console.error("Assigned students fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assigned students" },
      { status: 500 }
    );
  }
}
