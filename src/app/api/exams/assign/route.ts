import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { examId, studentIds, assignedBy, mode = "same" } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    /* -------------------------------------------------
       1️⃣ CHECK if assignment already exists
    ------------------------------------------------- */
    let assignment = await prisma.exam_assignments.findFirst({
      where: { exam_id: examId },
    });

    /* -------------------------------------------------
       2️⃣ CREATE or UPDATE assignment
    ------------------------------------------------- */
    if (!assignment) {
      assignment = await prisma.exam_assignments.create({
        data: {
          exam_id: examId,
          assigned_by: assignedBy,
          mode,
        },
      });
    } else {
      await prisma.exam_assignments.update({
        where: { id: assignment.id },
        data: {
          assigned_by: assignedBy,
          mode,
        },
      });
    }

    /* -------------------------------------------------
       3️⃣ DELETE old students for this exam
    ------------------------------------------------- */
    await prisma.exam_assignment_students.deleteMany({
      where: { assignment_id: assignment.id },
    });

    /* -------------------------------------------------
       4️⃣ INSERT current selected students
    ------------------------------------------------- */
    if (studentIds && studentIds.length > 0) {
      await prisma.exam_assignment_students.createMany({
        data: studentIds.map((studentId: number) => ({
          assignment_id: assignment.id,
          student_id: studentId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Exam assignment updated successfully",
    });
  } catch (error) {
    console.error("Assign exam error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign exam" },
      { status: 500 }
    );
  }
}
