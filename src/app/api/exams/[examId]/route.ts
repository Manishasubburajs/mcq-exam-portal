import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ===========================
    GET: Fetch single exam details
=========================== */
export async function GET(
  req: Request,
  { params }: { params: { examId: string } },
) {
  try {
    const examId = parseInt(params.examId);

    const exam = await prisma.exams.findUnique({
      where: { exam_id: examId },
      include: {
        exam_subject_configs: {
          include: {
            subject: true,
            topic: true,
          },
        },
        _count: {
          select: {
            exam_assignments: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 },
      );
    }

    const transformedExam = {
      id: exam.exam_id,
      exam_name: exam.exam_title,
      exam_type: exam.exam_type,
      status: exam.is_active ? "active" : "inactive",
      questions_count: exam.question_count,
      duration_minutes: exam.time_limit_minutes,
      created_at: exam.created_at.toISOString(),
      scheduled_start: exam.scheduled_start?.toISOString() || null,
      scheduled_end: exam.scheduled_end?.toISOString() || null,
      description: exam.description,
      canEdit: exam._count.exam_assignments === 0,
      canDelete: exam._count.exam_assignments === 0,
      subjects: exam.exam_subject_configs.map((cfg) => ({
        subject_id: cfg.subject_id,
        subject_name: cfg.subject.subject_name,
        topic_id: cfg.topic_id,
        topic_name: cfg.topic ? cfg.topic.topic_name : null,
        question_count: cfg.question_count,
      })),
    };

    return NextResponse.json(transformedExam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam" },
      { status: 500 },
    );
  }
}

/* ===========================
    PUT: Update exam (LOCKED)
=========================== */
export async function PUT(
  req: Request,
  { params }: { params: { examId: string } },
) {
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
      duration?: number;
      startTime?: string;
      endTime?: string;
      topicCounts: Record<number, number>;
    } = body;

    if (!examTitle || !examType || !topicCounts) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    /* 🔒 LOCK: Check if exam already assigned */
    const assignedCount = await prisma.exam_assignments.count({
      where: { exam_id: examId },
    });

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot edit exam. Exam is already assigned to students.",
        },
        { status: 409 },
      );
    }

    /* ⏱ Duration rules */
    if ((examType === "mock" || examType === "live") && !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration is required for mock and live exams",
        },
        { status: 400 },
      );
    }

    const totalQuestions = Object.values(topicCounts).reduce(
      (sum, count) => sum + Number(count),
      0,
    );

    /* -----------------------------
       TRANSACTION START
    ----------------------------- */
    await prisma.$transaction(async (tx) => {
      /* ---- Update Exam ---- */
      await tx.exams.update({
        where: { exam_id: examId },
        data: {
          exam_title: examTitle,
          description,
          exam_type: examType,

          // Practice → no timing
          time_limit_minutes: examType === "practice" ? null : duration,

          // Only LIVE exams have schedule
          scheduled_start:
            examType === "live" && startTime ? new Date(startTime) : null,

          scheduled_end:
            examType === "live" && endTime ? new Date(endTime) : null,

          question_count: totalQuestions,
          updated_at: new Date(),
        },
      });

      /* ---- Remove old configs ---- */
      await tx.exam_subject_configs.deleteMany({
        where: { exam_id: examId },
      });

      /* ---- Fetch topics ---- */
      const topicIds = Object.keys(topicCounts).map(Number);

      const topics = await tx.topics.findMany({
        where: { topic_id: { in: topicIds } },
        select: {
          topic_id: true,
          subject_id: true,
        },
      });

      /* ---- Insert new configs ---- */
      await tx.exam_subject_configs.createMany({
        data: topics.map((t) => ({
          exam_id: examId,
          subject_id: t.subject_id,
          topic_id: t.topic_id,
          question_count: topicCounts[t.topic_id],
        })),
      });
    });

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/exams/[examId] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update exam" },
      { status: 500 },
    );
  }
}

/* ===========================
   DELETE: Delete exam
=========================== */
export async function DELETE(
  req: Request,
  { params }: { params: { examId: string } },
) {
  try {
    const examId = parseInt(params.examId);

    // Check if exam is assigned
    const assignedCount = await prisma.exam_assignments.count({
      where: { exam_id: examId },
    });

    if (assignedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete exam. Exam is already assigned to students.",
        },
        { status: 409 },
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
