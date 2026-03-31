import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { shuffleArray } from "@/utils/shuffle";

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
        exam_questions: true,

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

    let status = exam.is_active ? "active" : "inactive";
    if (exam.exam_type === "live" && exam.scheduled_end) {
      const now = new Date();
      const end = new Date(exam.scheduled_end);
      if (now > end) {
        status = "inactive";
      } else {
        status = "active";
      }
    }

    const transformedExam = {
      id: exam.exam_id,
      exam_name: exam.exam_title,
      exam_type: exam.exam_type,
      status,
      questions_count: exam.question_count,
      duration_minutes: exam.time_limit_minutes,
      created_at: exam.created_at.toISOString(),
      scheduled_start: exam.scheduled_start?.toISOString() || null,
      scheduled_end: exam.scheduled_end?.toISOString() || null,
      description: exam.description,
      canEdit: exam._count.exam_assignments === 0,
      canDelete: exam._count.exam_assignments === 0,
      selection_mode: exam.selection_mode || "auto",
      subjects: exam.exam_subject_configs.map((cfg) => ({
        subject_id: cfg.subject_id,
        subject_name: cfg.subject.subject_name,
        topic_id: cfg.topic_id,
        topic_name: cfg.topic ? cfg.topic.topic_name : null,
        question_count: cfg.question_count,
      })),
      selectedQuestions: exam.exam_questions.map((q) => q.question_id),
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
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.userId;

    const examId = parseInt(params.examId);
    const body = await req.json();

    const {
      examTitle,
      description,
      examType,
      duration,
      startTime,
      endTime,
      topicCounts = {},
      selectedQuestions = [],
      selectionMode,
    }: {
      examTitle: string;
      description?: string;
      examType: "practice" | "mock" | "live";
      duration: number;
      startTime?: string;
      endTime?: string;
      topicCounts: Record<number, number>;
      selectedQuestions: number[];
      selectionMode: "auto" | "manual";
    } = body;

    /* ================= VALIDATION ================= */
    if (!examTitle || !examType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid duration" },
        { status: 400 },
      );
    }

    if (selectionMode === "manual" && selectedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one question" },
        { status: 400 },
      );
    }

    if (selectionMode === "auto" && Object.keys(topicCounts).length === 0) {
      return NextResponse.json(
        { success: false, message: "Please configure topics" },
        { status: 400 },
      );
    }

    /* ================= LOCK CHECK ================= */
    const assignedStudents = await prisma.exam_assignment_students.count({
      where: { assignment: { exam_id: examId } },
    });

    const startedAttempts = await prisma.student_exam_attempts.count({
      where: { exam_id: examId },
    });

    if (assignedStudents > 0 || startedAttempts > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot edit exam. Students assigned or attempts already started.",
        },
        { status: 409 },
      );
    }

    /* ================= TOTAL QUESTIONS ================= */
    const totalQuestions =
      selectionMode === "manual"
        ? selectedQuestions.length
        : Object.values(topicCounts).reduce(
            (sum: number, v: number) => sum + Number(v),
            0,
          );

    /* ================= TRANSACTION ================= */
    await prisma.$transaction(async (tx) => {
      let totalMarks = 0;
      let questionOrder = 1;
      const examQuestionsData: any[] = [];

      /* ---------- DELETE OLD DATA ---------- */
      await tx.exam_subject_configs.deleteMany({
        where: { exam_id: examId },
      });

      await tx.exam_questions.deleteMany({
        where: { exam_id: examId },
      });

      /* ================= AUTO MODE ================= */
      if (selectionMode === "auto") {
        const topicIds = Object.keys(topicCounts).map(Number);

        const topics = await tx.topics.findMany({
          where: { topic_id: { in: topicIds } },
        });

        // Insert subject configs
        await tx.exam_subject_configs.createMany({
          data: topics.map((t) => ({
            exam_id: examId,
            subject_id: t.subject_id,
            topic_id: t.topic_id,
            question_count: topicCounts[t.topic_id],
          })),
        });

        // 👉 EXACT SAME LOGIC AS CREATE
        for (const [topicIdStr, count] of Object.entries(topicCounts)) {
          const topicId = Number(topicIdStr);

          const allQuestions = await tx.questions.findMany({
            where: { topic_id: topicId },
          });

          if (allQuestions.length < count) {
            throw new Error(`Not enough questions for topic ${topicId}`);
          }

          const selected = shuffleArray(allQuestions).slice(0, count);

          for (const q of selected) {
            examQuestionsData.push({
              exam_id: examId,
              question_id: q.question_id,
              question_order: questionOrder++,
              assigned_marks: q.marks,
              assigned_negative: q.negative_marks,
            });

            totalMarks += Number(q.marks);
          }
        }
      }

      /* ================= MANUAL MODE ================= */
      if (selectionMode === "manual") {
        const questions = await tx.questions.findMany({
          where: { question_id: { in: selectedQuestions } },
          select: {
            question_id: true,
            topic_id: true,
            marks: true,
            negative_marks: true,
            topic: { select: { subject_id: true } },
          },
        });

        // 🔥 ADD THIS
        const topicMap: Record<number, number> = {};

        questions.forEach((q) => {
          topicMap[q.topic_id] = (topicMap[q.topic_id] || 0) + 1;
        });

        await tx.exam_subject_configs.createMany({
          data: Object.entries(topicMap).map(([topicId, count]) => {
            const subjectId = questions.find(
              (q) => q.topic_id === Number(topicId),
            )?.topic.subject_id;

            if (!subjectId) {
              throw new Error("Invalid subject mapping");
            }

            return {
              exam_id: examId,
              subject_id: subjectId,
              topic_id: Number(topicId),
              question_count: count,
            };
          }),
        });

        // 🔽 KEEP YOUR EXISTING QUESTION INSERT LOGIC BELOW
        const orderedQuestions = selectedQuestions
          .map((id: number) => questions.find((q) => q.question_id === id))
          .filter(Boolean);

        for (const q of orderedQuestions as any[]) {
          examQuestionsData.push({
            exam_id: examId,
            question_id: q.question_id,
            question_order: questionOrder++,
            assigned_marks: q.marks,
            assigned_negative: q.negative_marks,
          });

          totalMarks += Number(q.marks);
        }
      }

      /* ---------- INSERT QUESTIONS ---------- */
      console.log("🧾 examQuestionsData:", examQuestionsData);
      await tx.exam_questions.createMany({
        data: examQuestionsData,
      });
      console.log("🧾 examQuestionsData:", examQuestionsData);

      /* ---------- UPDATE EXAM ---------- */
      await tx.exams.update({
        where: { exam_id: examId },
        data: {
          exam_title: examTitle,
          description,
          exam_type: examType,
          selection_mode: selectionMode,
          time_limit_minutes: duration,

          scheduled_start:
            examType === "live" && startTime ? new Date(startTime) : null,

          scheduled_end:
            examType === "live" && endTime ? new Date(endTime) : null,

          question_count: totalQuestions,
          total_marks: totalMarks,

          updated_at: new Date(),
          updated_by: userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
    });
  } catch (error: any) {
    console.error("PUT /api/exams/[examId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update exam",
      },
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

    // Fetch all assignments for this exam
    const assignments = await prisma.exam_assignments.findMany({
      where: { exam_id: examId },
      select: { id: true },
    });

    if (assignments.length > 0) {
      // Count all students assigned across these assignments
      const studentCount = await prisma.exam_assignment_students.count({
        where: { assignment_id: { in: assignments.map((a) => a.id) } },
      });

      if (studentCount > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot delete exam. Exam is already assigned to students.",
          },
          { status: 409 },
        );
      }
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
