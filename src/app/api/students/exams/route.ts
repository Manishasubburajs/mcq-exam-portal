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

    if (examId) {
      // Fetch specific exam details with questions
      const examIdNum = parseInt(examId);

      // Check if assigned
      const assignment = await prisma.exam_assignment_students.findFirst({
        where: {
          student_id: studentId,
          assignment: {
            exam_id: examIdNum,
          },
        },
        include: {
          assignment: {
            include: {
              exam: {
                include: {
                  exam_questions: {
                    include: {
                      question: true,
                    },
                    orderBy: {
                      question_order: "asc",
                    },
                  },
                  exam_subject_configs: {
                    include: {
                      subject: true,
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
      const subject = exam.exam_subject_configs[0]?.subject?.subject_name || "";

      const questions = exam.exam_questions.map(eq => ({
        id: eq.question.question_id,
        text: eq.question.question_text,
        options: [
          { id: 'A', text: eq.question.option_a || '' },
          { id: 'B', text: eq.question.option_b || '' },
          { id: 'C', text: eq.question.option_c || '' },
          { id: 'D', text: eq.question.option_d || '' },
        ].filter(opt => opt.text), // Remove empty options
        correctAnswer: eq.question.correct_answer || '',
      }));

      const examData = {
        id: exam.exam_id,
        title: exam.exam_title,
        subject: subject,
        duration: exam.time_limit_minutes,
        totalQuestions: exam.question_count,
        questions: questions,
        examType: exam.exam_type,
        points: parseFloat(exam.total_marks.toString()),
      };

      return NextResponse.json({ success: true, data: examData });
    } else {
      // Fetch assigned exams that are not completed
      const assignedExams = await prisma.exam_assignment_students.findMany({
        where: { student_id: studentId },
        include: {
          assignment: {
            include: {
              exam: {
                include: {
                  exam_subject_configs: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Filter out completed exams and ensure uniqueness
      const availableExamsMap = new Map();
      for (const assignment of assignedExams) {
        const exam = assignment.assignment.exam;
        const examId = exam.exam_id;

        // Skip if already processed
        if (availableExamsMap.has(examId)) continue;

        const attempt = await prisma.student_exam_attempts.findFirst({
          where: {
            student_id: studentId,
            exam_id: examId,
            status: "completed",
          },
        });

        if (!attempt) {
          // Not completed, so available
          const subject = exam.exam_subject_configs[0]?.subject?.subject_name || "";
          availableExamsMap.set(examId, {
            id: examId,
            title: exam.exam_title,
            subject: subject,
            duration: exam.time_limit_minutes,
            questions: exam.question_count,
            due: exam.scheduled_end ? exam.scheduled_end.toISOString().split('T')[0] : "No due date",
            points: exam.total_marks.toString(),
          });
        }
      }

      const availableExams = Array.from(availableExamsMap.values());

      return NextResponse.json({ success: true, data: availableExams });
    }
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}