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
      exam_type,
      total_marks,
      time_limit_minutes,
      scheduled_start,
      scheduled_end,
      subject_configs,
      topic_configs,
      randomize_questions,
      show_results,
      allow_review,
      negative_marking,
      pass_percentage,
      proctoring,
      participant_capacity,
      registration_deadline,
      proctoring_enabled,
      auto_submit,
      allow_camera,
      require_id,
    } = data;

    // Determine subject_id for uniqueness check (use first subject for practice exams)
    let subjectIdForCheck = null;
    if (exam_type === 'practice' && subject_configs?.length > 0) {
      subjectIdForCheck = subject_configs[0].subject_id;
    } else if ((exam_type === 'mock' || exam_type === 'live') && topic_configs?.length > 0) {
      // Get subject_id from first topic
      const firstTopic = await prisma.topics.findUnique({
        where: { topic_id: topic_configs[0].topic_id },
        select: { subject_id: true }
      });
      subjectIdForCheck = firstTopic?.subject_id;
    }

    // 🧩 0️⃣ Check duplicate exam title within same subject
    if (subjectIdForCheck) {
      const existing = await prisma.exams.findFirst({
        where: {
          subject_id: subjectIdForCheck,
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
    }

    // 🧩 1️⃣ Insert exam record and configurations in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const exam = await tx.exams.create({
        data: {
          exam_title,
          exam_type: exam_type as any,
          subject_id: subjectIdForCheck,
          time_limit_minutes,
          duration_minutes: time_limit_minutes, // For consistency
          total_marks: total_marks ? parseFloat(total_marks) : 0,
          scheduled_start: scheduled_start ? new Date(scheduled_start) : null,
          scheduled_end: scheduled_end ? new Date(scheduled_end) : null,
          is_active: true,
          created_by: 1, // TODO: Get from session
          status: "published", // Default to published for now
          allow_multiple_attempts: exam_type === 'practice',
          single_attempt: exam_type !== 'practice',
          // Additional fields for live exams
          ...(exam_type === 'live' && {
            participant_capacity,
            registration_deadline: registration_deadline ? new Date(registration_deadline) : null,
            proctoring_enabled,
            auto_submit,
            allow_camera,
            require_id,
          }),
        },
      });

      // 🧩 2️⃣ Insert subject/topic configurations
      if (subject_configs && subject_configs.length > 0) {
        const configData = subject_configs.map((config: any) => ({
          exam_id: exam.exam_id,
          subject_id: config.subject_id,
          question_count: config.question_count,
        }));
        await tx.exam_subject_configs.createMany({ data: configData });
      }

      if (topic_configs && topic_configs.length > 0) {
        const configData = topic_configs.map((config: any) => ({
          exam_id: exam.exam_id,
          topic_id: config.topic_id,
          question_count: config.question_count,
        }));
        await tx.exam_subject_configs.createMany({ data: configData });
      }

      // 🧩 3️⃣ Select and assign questions based on configurations
      let totalQuestions = 0;
      const examQuestions: any[] = [];

      if (subject_configs) {
        for (const config of subject_configs) {
          const questions = await tx.questions.findMany({
            where: {
              subject_id: config.subject_id,
              is_draft: false,
            },
            take: config.question_count,
            orderBy: randomize_questions ? { question_id: 'RANDOM' } : { question_id: 'asc' },
          });

          if (questions.length < config.question_count) {
            throw new Error(`Not enough questions available for subject ${config.subject_id}`);
          }

          questions.forEach((q: any) => {
            examQuestions.push({
              exam_id: exam.exam_id,
              question_id: q.question_id,
              question_order: ++totalQuestions,
              assigned_marks: q.marks,
              assigned_negative: negative_marking ? q.negative_marks : 0,
            });
          });
        }
      }

      if (topic_configs) {
        for (const config of topic_configs) {
          const questions = await tx.questions.findMany({
            where: {
              topic_id: config.topic_id,
              is_draft: false,
            },
            take: config.question_count,
            orderBy: randomize_questions ? { question_id: 'RANDOM' } : { question_id: 'asc' },
          });

          if (questions.length < config.question_count) {
            throw new Error(`Not enough questions available for topic ${config.topic_id}`);
          }

          questions.forEach((q: any) => {
            examQuestions.push({
              exam_id: exam.exam_id,
              question_id: q.question_id,
              question_order: ++totalQuestions,
              assigned_marks: q.marks,
              assigned_negative: negative_marking ? q.negative_marks : 0,
            });
          });
        }
      }

      if (examQuestions.length > 0) {
        await tx.exam_questions.createMany({ data: examQuestions });
      }

      // Update question_count in exam
      await tx.exams.update({
        where: { exam_id: exam.exam_id },
        data: { question_count: totalQuestions },
      });

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
// ✅ GET ALL EXAMS (GET)
// ========================
export async function GET() {
  try {
    const exams = await prisma.exams.findMany({
      where: {
        is_active: true,
      },
      include: {
        subjects: true,
        _count: {
          select: {
            questions: true,
            student_exam_attempts: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get configurations separately
    const examIds = exams.map(e => e.exam_id);
    const configs = await prisma.exam_subject_configs.findMany({
      where: {
        exam_id: { in: examIds },
      },
      include: {
        subjects: true,
        topics: true,
      },
    });

    const configMap = configs.reduce((acc, config) => {
      if (!acc[config.exam_id]) acc[config.exam_id] = [];
      acc[config.exam_id].push(config);
      return acc;
    }, {} as any);

    const formattedExams = exams.map((exam: any) => {
      // Get subject and topic names from configs
      let subjectName = exam.subjects?.subject_name || '';
      let topicName = '';

      if (exam.exam_subject_configs.length > 0) {
        const firstConfig = exam.exam_subject_configs[0];
        if (firstConfig.subjects) {
          subjectName = firstConfig.subjects.subject_name;
        }
        if (firstConfig.topics) {
          topicName = firstConfig.topics.topic_name;
        }
      }

      return {
        id: exam.exam_id,
        exam_name: exam.exam_title,
        subject_name: subjectName,
        topic_name: topicName,
        subject_id: exam.subject_id,
        topic_id: exam.exam_subject_configs[0]?.topic_id || null,
        exam_type: exam.exam_type,
        status: exam.status === 'published' ? 'active' : exam.status,
        questions_count: exam.question_count || 0,
        duration_minutes: exam.time_limit_minutes || 0,
        created_at: exam.created_at?.toISOString(),
        total_participants: exam._count.student_exam_attempts,
      };
    });

    return NextResponse.json(formattedExams);
  } catch (err) {
    console.error("❌ Error fetching exams:", err);
    return NextResponse.json({
      success: false,
      error: "Error fetching exams",
    });
  }
}
