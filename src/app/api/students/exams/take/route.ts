export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { shuffleArray } from "@/utils/shuffle";

/* --------------------------------------------------
   Helper: Can student take exam now?
-------------------------------------------------- */
function canTakeExam(exam: any) {
  if (exam.exam_type === "practice" || exam.exam_type === "mock") return true;

  const now = new Date();
  if (exam.scheduled_start && now < exam.scheduled_start) return false;
  if (exam.scheduled_end && now > exam.scheduled_end) return false;

  return true;
}

/* --------------------------------------------------
   GET : Load exam questions (NO DB WRITE)
-------------------------------------------------- */
export async function GET(req: Request) {
  try {
    /* ---------- AUTH ---------- */
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = decoded.userId;

    /* ---------- PARAM ---------- */
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("id");
    if (!examId) {
      return NextResponse.json(
        { success: false, message: "Exam ID required" },
        { status: 400 }
      );
    }

    const examIdNum = Number(examId);

    /* ---------- CHECK ASSIGNMENT ---------- */
    const assignmentRow = await prisma.exam_assignment_students.findFirst({
      where: {
        student_id: studentId,
        assignment: { exam_id: examIdNum },
      },
      include: {
        assignment: {
          include: {
            exam: {
              include: { exam_subject_configs: true },
            },
          },
        },
      },
    });

    if (!assignmentRow) {
      return NextResponse.json(
        { success: false, message: "Exam not assigned" },
        { status: 403 }
      );
    }

    const assignment = assignmentRow.assignment;
    const exam = assignment.exam;

    if (!canTakeExam(exam)) {
      return NextResponse.json(
        { success: false, message: "Exam not available now" },
        { status: 403 }
      );
    }

    /* ---------- FETCH QUESTIONS ---------- */
    let questions: any[] = [];

    for (const cfg of exam.exam_subject_configs) {
      if (!cfg.topic_id) continue;

      const topicQuestions = await prisma.questions.findMany({
        where: { topic_id: cfg.topic_id },
        take: cfg.question_count,
      });

      questions.push(
        ...topicQuestions.map((q) => ({
          id: q.question_id,
          text: q.question_text,
          options: [
            { id: "A", text: q.option_a },
            { id: "B", text: q.option_b },
            { id: "C", text: q.option_c },
            { id: "D", text: q.option_d },
          ].filter((o) => o.text),
        }))
      );
    }

    /* ---------- SHUFFLE (IN MEMORY ONLY) ---------- */
    if (assignment.shuffle_questions) {
      questions = shuffleArray(questions);
      questions = questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    /* ---------- RESPONSE (NO DB SAVE) ---------- */
    return NextResponse.json({
      success: true,
      data: {
        examId: exam.exam_id,
        title: exam.exam_title,
        duration: exam.time_limit_minutes,
        totalQuestions: questions.length,
        shuffle: assignment.shuffle_questions,
        questions,
      },
    });
  } catch (error) {
    console.error("Take exam API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load exam" },
      { status: 500 }
    );
  }
}
