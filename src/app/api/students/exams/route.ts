export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("id");

    /* ======================================================
       SINGLE EXAM DETAILS (START EXAM)
    ====================================================== */
    if (examId) {
      const examIdNum = Number(examId);

      const assignment = await prisma.exam_assignment_students.findFirst({
        where: {
          student_id: studentId,
          assignment: { exam_id: examIdNum },
        },
        include: {
          assignment: {
            include: {
              exam: {
                include: {
                  exam_subject_configs: {
                    include: {
                      subject: true,
                      topic: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Exam not assigned or not found" },
          { status: 404 }
        );
      }

      const exam = assignment.assignment.exam;

      /* ✅ FIX: collect ALL subjects (unique) */
      const subjects = [
        ...new Set(
          exam.exam_subject_configs.map(
            (c) => c.subject.subject_name
          )
        ),
      ];

      /* ------------------ QUESTIONS ------------------ */
      let allQuestions: any[] = [];

      for (const cfg of exam.exam_subject_configs) {
        if (!cfg.topic_id) continue;

        const topicQuestions = await prisma.questions.findMany({
          where: { topic_id: cfg.topic_id },
        });

        const shuffled = topicQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, cfg.question_count);

        allQuestions.push(
          ...selected.map((q) => ({
            id: q.question_id,
            text: q.question_text,
            options: [
              { id: "A", text: q.option_a },
              { id: "B", text: q.option_b },
              { id: "C", text: q.option_c },
              { id: "D", text: q.option_d },
            ].filter((o) => o.text),
            correctAnswer: q.correct_answer,
          }))
        );
      }

      const examData = {
        id: exam.exam_id,
        title: exam.exam_title,
        subject: subjects.join(", "), // ✅ FIXED
        duration: exam.time_limit_minutes,
        totalQuestions: exam.question_count,
        questions: allQuestions.sort(() => 0.5 - Math.random()),
        examType: exam.exam_type,
        points: Number(exam.total_marks || 0),
      };

      return NextResponse.json({ success: true, data: examData });
    }

    /* ======================================================
       AVAILABLE EXAMS LIST
    ====================================================== */
    const assignedExams = await prisma.exam_assignment_students.findMany({
      where: { student_id: studentId },
      include: {
        assignment: {
          include: {
            exam: {
              include: {
                exam_subject_configs: {
                  include: { subject: true },
                },
              },
            },
          },
        },
      },
    });

    const availableExamsMap = new Map<number, any>();

    for (const a of assignedExams) {
      const exam = a.assignment.exam;
      if (availableExamsMap.has(exam.exam_id)) continue;

      const completed = await prisma.student_exam_attempts.findFirst({
        where: {
          student_id: studentId,
          exam_id: exam.exam_id,
          status: "completed",
        },
      });

      if (completed) continue;

      /* ✅ FIX: MULTIPLE SUBJECTS */
      const subjects = [
        ...new Set(
          exam.exam_subject_configs.map(
            (c) => c.subject.subject_name
          )
        ),
      ];

      availableExamsMap.set(exam.exam_id, {
        id: exam.exam_id,
        title: exam.exam_title,
        subject: subjects.join(", "), // ✅ FIXED
        duration: exam.time_limit_minutes,
        questions: exam.question_count,
        due: exam.scheduled_end
          ? exam.scheduled_end.toISOString().split("T")[0]
          : "No due date",
        points: String(exam.total_marks || 0),
        examType: exam.exam_type,
      });
    }

    return NextResponse.json({
      success: true,
      data: Array.from(availableExamsMap.values()),
    });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
