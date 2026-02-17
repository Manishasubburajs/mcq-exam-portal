import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      examId,
      studentIds = [],
      assignedBy,
      shuffleEnabled = false, // from UI checkbox
    } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Exam ID is required" },
        { status: 400 },
      );
    }

    const mode = shuffleEnabled ? "shuffle" : "same";

    /* -------------------------------------------------
       1️⃣ CHECK existing assignment
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
          mode, // ✅ REQUIRED FIELD
        },
      });
    } else {
      assignment = await prisma.exam_assignments.update({
        where: { id: assignment.id },
        data: {
          assigned_by: assignedBy,
          mode,
        },
      });
    }

    /* -------------------------------------------------
       3️⃣ GET existing assigned students
    ------------------------------------------------- */
    const existingStudents = await prisma.exam_assignment_students.findMany({
      where: { assignment_id: assignment.id },
      select: { student_id: true },
    });

    const existingStudentIds = existingStudents.map((s) => s.student_id);

    /* -------------------------------------------------
       4️⃣ Find students being removed
    ------------------------------------------------- */
    const studentsToRemove = existingStudentIds.filter(
      (id) => !studentIds.includes(id),
    );

    /* -------------------------------------------------
   5️⃣ Check if removed students started/completed exam
------------------------------------------------- */
    if (studentsToRemove.length > 0) {
      const lockedStudents = await prisma.student_exam_attempts.findMany({
        where: {
          exam_id: examId,
          student_id: { in: studentsToRemove },
          status: {
            in: ["in_progress", "completed"], // 🔥 block both
          },
        },
        select: { student_id: true, status: true },
      });

      if (lockedStudents.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot unassign student(s) who have started or completed the exam.",
          },
          { status: 400 },
        );
      }
    }

    /* -------------------------------------------------
       6️⃣ Safe to remove students
    ------------------------------------------------- */
    if (studentsToRemove.length > 0) {
      await prisma.exam_assignment_students.deleteMany({
        where: {
          assignment_id: assignment.id,
          student_id: { in: studentsToRemove },
        },
      });
    }

    /* -------------------------------------------------
       7️⃣ Add newly selected students
    ------------------------------------------------- */
    const studentsToAdd = studentIds.filter(
      (id: number) => !existingStudentIds.includes(id),
    );

    if (studentsToAdd.length > 0) {
      await prisma.exam_assignment_students.createMany({
        data: studentsToAdd.map((studentId: number) => ({
          assignment_id: assignment.id,
          student_id: studentId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Exam assignment updated successfully",
      mode,
    });
  } catch (error) {
    console.error("Assign exam error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign exam" },
      { status: 500 },
    );
  }
}
