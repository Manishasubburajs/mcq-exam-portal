import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ========================
// ✅ CREATE EXAM (POST)
// ========================
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      exam_title,
      description,
      subject_id,
      time_limit_minutes,
      total_marks,
      scheduled_start,
      scheduled_end,
      created_by,
      status,
      questions,
    } = data;

    // 🧩 0️⃣ Check duplicate exam title within same subject
    const existing = await prisma.exams.findFirst({
      where: {
        subject_id: subject_id,
        exam_title: exam_title,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam title already exists for this subject!",
        },
        { status: 400 }
      );
    }

    // 🧩 1️⃣ Insert exam record and questions in a transaction
    const result = await prisma.$transaction(async (tx:any) => {
      const exam = await tx.exams.create({
        data: {
          exam_title,
          description,
          subject_id,
          time_limit_minutes,
          total_marks,
          scheduled_start: new Date(scheduled_start),
          scheduled_end: new Date(scheduled_end),
          created_by,
          status: status as any,
        },
      });

      // 🧩 2️⃣ Insert related questions
      if (questions && questions.length > 0) {
        const questionData = questions.map((q: any) => {
          // Ensure correct_answer is one of A/B/C/D
          const validAnswers = ["A", "B", "C", "D"];
          if (!validAnswers.includes(q.correct_answer)) {
            throw new Error(
              `Invalid correct answer: ${q.correct_answer}. Must be A/B/C/D.`
            );
          }

          return {
            exam_id: exam.exam_id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            points: q.points || 1,
            difficulty: (q.difficulty || "Medium") as any,
            subject_id: subject_id,
            created_by: created_by,
            is_draft: status === "draft",
          };
        });

        await tx.questions.createMany({
          data: questionData,
        });
      }

      return exam;
    });

    return NextResponse.json({ success: true, exam_id: result.exam_id });
  } catch (err) {
    console.error("❌ Error saving exam:", err);
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    });
  }
}

// ========================
// ✅ GET DRAFT EXAMS (GET)
// ========================
export async function GET() {
  try {
    const drafts = await prisma.exams.findMany({
      where: {
        status: "draft",
      },
      select: {
        exam_id: true,
        exam_title: true,
        subject_id: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedDrafts = drafts.map((draft:any) => ({
      exam_id: draft.exam_id,
      exam_title: draft.exam_title,
      subject_id: draft.subject_id,
      question_count: draft._count.questions,
    }));

    return NextResponse.json(formattedDrafts);
  } catch (err) {
    console.error("❌ Error fetching drafts:", err);
    return NextResponse.json({
      success: false,
      error: "Error fetching drafts",
    });
  }
}
