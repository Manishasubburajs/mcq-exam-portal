import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shuffleArray } from "@/utils/shuffle";

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
        _count: {
          select: {
            exam_assignments: true, // 👈 IMPORTANT
          },
        },
      },
    });

    const transformedExams = exams.map((exam) => {
      const isAssigned = exam._count.exam_assignments > 0;

      return {
        id: exam.exam_id,
        exam_name: exam.exam_title,
        exam_type: exam.exam_type,
        status: exam.is_active ? "active" : "inactive",
        questions_count: exam.question_count,
        duration_minutes: exam.time_limit_minutes,
        created_at: exam.created_at.toISOString(),
        scheduled_start: exam.scheduled_start?.toISOString() || null,
        scheduled_end: exam.scheduled_end?.toISOString() || null,

        canEdit: !isAssigned,
        canDelete: !isAssigned,

        subjects: exam.exam_subject_configs.map((cfg) => ({
          subject_id: cfg.subject_id,
          subject_name: cfg.subject.subject_name,
          topic_id: cfg.topic_id,
          topic_name: cfg.topic ? cfg.topic.topic_name : null,
          question_count: cfg.question_count,
        })),
      };
    });

    return NextResponse.json(transformedExams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 },
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
      description?: string;
      examType: "practice" | "mock" | "live";
      duration: number;
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

    // ⏱ Duration is REQUIRED only for mock & live
    if ((examType === "mock" || examType === "live") && !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration is required for mock and live exams",
        },
        { status: 400 },
      );
    }

    /* -----------------------------
       Calculate total questions
    ----------------------------- */
    const totalQuestions = Object.values(topicCounts).reduce(
      (sum, v) => sum + Number(v),
      0,
    );

    /* -----------------------------
       TRANSACTION START
    ----------------------------- */
    const exam = await prisma.$transaction(async (tx) => {
      /* ---- Create Exam ---- */
      const exam = await tx.exams.create({
        data: {
          exam_title: examTitle,
          description,
          exam_type: examType,
          time_limit_minutes: examType === "practice" ? null : duration,

          scheduled_start:
            examType === "live" && startTime ? new Date(startTime) : null,

          scheduled_end:
            examType === "live" && endTime ? new Date(endTime) : null,

          question_count: totalQuestions,
          is_active: true,
        },
      });

      /* -----------------------------
         FETCH TOPICS (for subject mapping)
      ----------------------------- */
      const topicIds = Object.keys(topicCounts).map(Number);

      const topics = await tx.topics.findMany({
        where: { topic_id: { in: topicIds } },
        select: {
          topic_id: true,
          subject_id: true,
        },
      });

      /* -----------------------------
         INSERT exam_subject_configs ✅
      ----------------------------- */
      await tx.exam_subject_configs.createMany({
        data: topics.map((t) => ({
          exam_id: exam.exam_id,
          subject_id: t.subject_id,
          topic_id: t.topic_id,
          question_count: topicCounts[t.topic_id],
        })),
      });

      /* -----------------------------
         PREPARE exam_questions
      ----------------------------- */
      let questionOrder = 1;
      const examQuestionsData: any[] = [];

      for (const [topicIdStr, count] of Object.entries(topicCounts)) {
        const topicId = Number(topicIdStr);
        if (count <= 0) continue;

        const allQuestions = await tx.questions.findMany({
          where: { topic_id: topicId },
          select: {
            question_id: true,
            marks: true,
            negative_marks: true,
          },
        });

        if (allQuestions.length < count) {
          throw new Error(`Not enough questions for topic ID ${topicId}`);
        }

        const selectedQuestions = shuffleArray(allQuestions).slice(0, count);

        for (const q of selectedQuestions) {
          examQuestionsData.push({
            exam_id: exam.exam_id,
            question_id: q.question_id,
            question_order: questionOrder++,
            assigned_marks: q.marks,
            assigned_negative: q.negative_marks,
          });
        }
      }

      /* ---- Insert exam_questions ---- */
      await tx.exam_questions.createMany({
        data: examQuestionsData,
      });

      return exam;
    });

    /* -----------------------------
       SUCCESS RESPONSE
    ----------------------------- */
    return NextResponse.json({
      success: true,
      message: "Exam created with random questions",
      examId: exam.exam_id,
    });
  } catch (error: any) {
    console.error("Error creating exam:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create exam",
      },
      { status: 500 },
    );
  }
}
