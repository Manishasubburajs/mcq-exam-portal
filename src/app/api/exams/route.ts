import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ===========================
   GET: Fetch exams list
=========================== */
export async function GET() {
  try {
    const exams = await prisma.exams.findMany({
      orderBy: { created_at: "desc" },
      include: {
        exam_subject_configs: {
          include: {
            subject: true,
            topic: true,
          },
        },
      },
    });

    const transformedExams = exams.map((exam) => ({
      id: exam.exam_id,
      exam_name: exam.exam_title,
      exam_type: exam.exam_type,
      status: exam.is_active ? "active" : "inactive",
      questions_count: exam.question_count,
      duration_minutes: exam.time_limit_minutes,
      created_at: exam.created_at.toISOString(),

      subjects: exam.exam_subject_configs.map((cfg) => ({
        subject_id: cfg.subject_id,
        subject_name: cfg.subject.subject_name,
        topic_id: cfg.topic_id,
        topic_name: cfg.topic.topic_name,
        question_count: cfg.question_count,
      })),
    }));

    return NextResponse.json(transformedExams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

/* ===========================
   POST: Create exam
=========================== */
export async function POST(req: Request) {
  try {
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
      description: string;
      examType: "practice" | "mock" | "live";
      duration: number;
      startTime?: string;
      endTime?: string;
      topicCounts: Record<number, number>;
    } = body;

    if (!examTitle || !examType || !duration || !topicCounts) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalQuestions = Object.values(topicCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    /* ---- Create Exam ---- */
    const exam = await prisma.exams.create({
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

    /* ---- Prepare subject/topic configs ---- */
    const configs = await Promise.all(
      Object.entries(topicCounts).map(async ([topicId, count]) => {
        const topic = await prisma.topics.findUnique({
          where: { topic_id: Number(topicId) },
        });

        if (!topic) {
          throw new Error(`Topic not found: ${topicId}`);
        }

        return {
          exam_id: exam.exam_id,
          subject_id: topic.subject_id,
          topic_id: Number(topicId),
          question_count: count,
        };
      })
    );

    await prisma.exam_subject_configs.createMany({
      data: configs,
    });

    return NextResponse.json({
      success: true,
      message: "Exam created successfully",
      examId: exam.exam_id,
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create exam" },
      { status: 500 }
    );
  }
}

/* ===========================
  DELETE: Delete exam
=========================== */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { examId }: { examId: number } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Exam ID is required" },
        { status: 400 }
      );
    }

    // Check if exam exists
    const exam = await prisma.exams.findUnique({
      where: { exam_id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Delete the exam (cascade will handle related records)
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
      { status: 500 }
    );
  }
}
