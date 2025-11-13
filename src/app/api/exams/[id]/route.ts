import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const examIdNum = parseInt(examId);

    // Fetch exam with related questions
    const exam = await prisma.exams.findUnique({
      where: { exam_id: examIdNum },
      include: {
        questions: {
          orderBy: { question_id: "asc" },
        },
        subjects: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ success: false, message: "Exam not found" });
    }

    const formattedExam = {
      ...exam,
      questions: exam.questions || [],
      question_count: exam.questions?.length || 0,
    };

    return NextResponse.json({ success: true, data: formattedExam });
  } catch (error) {
    console.error("❌ Error fetching exam:", error);
    return NextResponse.json({ success: false, message: "Error fetching exam" });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const examIdNum = parseInt(examId);

    // Delete the exam (Prisma will handle cascading deletes)
    await prisma.exams.delete({
      where: { exam_id: examIdNum },
    });

    return NextResponse.json({ success: true, message: "Draft exam deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting draft:", error);
    return NextResponse.json({ success: false, message: "Error deleting draft" });
  }
}
