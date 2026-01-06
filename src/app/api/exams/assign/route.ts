import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      examId,
      studentIds,
      assignedBy,
      mode = "same",
    }: {
      examId: number;
      studentIds: number[];
      assignedBy: number;
      mode?: "same" | "shuffle" | "random";
    } = body;

    if (!examId || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    // 1. Create assignment
    const assignment = await prisma.exam_assignments.create({
      data: {
        exam_id: examId,
        assigned_by: assignedBy,
        mode,
      },
    });

    // 2. Assign students
    const studentRows = studentIds.map((id) => ({
      assignment_id: assignment.id,
      student_id: id,
    }));

    await prisma.exam_assignment_students.createMany({
      data: studentRows,
    });

    return NextResponse.json({
      success: true,
      message: "Exam assigned successfully",
    });
  } catch (err) {
    console.error("Assign exam error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to assign exam" },
      { status: 500 }
    );
  }
}
