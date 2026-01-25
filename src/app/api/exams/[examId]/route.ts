import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ===========================
   PUT: Update exam
=========================== */
export async function PUT(req: Request, { params }: { params: { examId: string } }) {
  try {
    const examId = parseInt(params.examId);
    const body = await req.json();

    const {
      examTitle,
      description,
      examType,
      duration,
      startTime,
      endTime,
      topicCounts,
    }: {
      examTitle: string;
      description?: string;
      examType: "practice" | "mock" | "live";
      duration: number;
      startTime?: string;
      endTime?: string;
      topicCounts: Record<number, number>;
    } = body;

    if (!examTitle || !examType || !duration || !topicCounts) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const totalQuestions = Object.values(topicCounts).reduce(
      (sum, count) => sum + Number(count),
      0,
    );

    /* ---- Update Exam ---- */
    const exam = await prisma.exams.update({
      where: { exam_id: examId },
      data: {
        exam_title: examTitle,
        description,
        exam_type: examType,
        time_limit_minutes: duration,
        scheduled_start: startTime ? new Date(startTime) : null,
        scheduled_end: endTime ? new Date(endTime) : null,
        question_count: totalQuestions,
      },
    });

    /* ---- Delete existing configs ---- */
    await prisma.exam_subject_configs.deleteMany({
      where: { exam_id: examId },
    });

    /* ---- Fetch all topics in ONE query ---- */
    const topicIds = Object.keys(topicCounts).map(Number);

    const topics = await prisma.topics.findMany({
      where: {
        topic_id: { in: topicIds },
      },
      select: {
        topic_id: true,
        subject_id: true,
      },
    });

    /* ---- Prepare configs ---- */
    const configs = topics.map((topic) => ({
      exam_id: exam.exam_id,
      subject_id: topic.subject_id,
      topic_id: topic.topic_id,
      question_count: topicCounts[topic.topic_id],
      shuffle: true, // 🔥 important
    }));

    await prisma.exam_subject_configs.createMany({
      data: configs,
    });

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      examId: exam.exam_id,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update exam" },
      { status: 500 },
    );
  }
}

/* ===========================
   DELETE: Delete exam
=========================== */
export async function DELETE(req: Request, { params }: { params: { examId: string } }) {
  try {
    const examId = parseInt(params.examId);

    // Check if exam is assigned
    const assignments = await prisma.exam_assignments.findMany({
      where: { exam_id: examId },
    });

    if (assignments.length > 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete exam that has been assigned to students" },
        { status: 400 },
      );
    }

    // Delete configs first
    await prisma.exam_subject_configs.deleteMany({
      where: { exam_id: examId },
    });

    // Delete exam
    await prisma.exams.delete({
      where: { exam_id: examId },
    });

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete exam" },
      { status: 500 },
    );
  }
}