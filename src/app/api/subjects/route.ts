// 📁 src/app/api/subjects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as yup from "yup";

// ----------------------
// Validation Schema
// ----------------------
const createSubjectSchema = yup.object({
  subject_name: yup.string().required("Subject name is required"),
  topics: yup
    .array()
    .of(yup.string().required("Topic name is required"))
    .min(1, "At least one topic is required"),
});

// ----------------------
// GET - Fetch all subjects
// ----------------------
export async function GET() {
  try {
    const subjects = await prisma.subjects.findMany({
      include: {
        topics: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      orderBy: { subject_name: "asc" },
    });

    const formattedSubjects = subjects.map((subject) => {
      const topics = subject.topics.map((topic) => {
        const questionCount = topic._count.questions;

        return {
          topic_id: topic.topic_id,
          topic_name: topic.topic_name,
          questionCount,
          canEdit: questionCount === 0,
          canDelete: questionCount === 0,
        };
      });

      const subjectHasQuestions = topics.some((t) => t.questionCount > 0);

      return {
        subject_id: subject.subject_id,
        subject_name: subject.subject_name,
        topic_count: topics.length,
        canEdit: !subjectHasQuestions,
        canDelete: !subjectHasQuestions,
        topics,
        created_at: subject.created_at,
      };
    });

    return NextResponse.json({ success: true, data: formattedSubjects });
  } catch (error) {
    console.error("❌ GET /subjects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subjects" },
      { status: 500 },
    );
  }
}

// ----------------------
// POST - Create subject + topics
// ----------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await createSubjectSchema.validate(body, { abortEarly: false });

    const { subject_name, topics } = body;

    const subject = await prisma.subjects.create({
      data: {
        subject_name,
        topics: {
          create: topics.map((topicName: string) => ({
            topic_name: topicName,
          })),
        },
      },
      include: {
        topics: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error: any) {
    console.error("❌ POST /subjects error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Subject name already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 },
    );
  }
}

// ----------------------
// PUT - Update subject + topics
// ----------------------
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = Number(searchParams.get("id"));

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Subject ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { subject_name, topics } = body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one topic is required" },
        { status: 400 },
      );
    }

    // Validate topic names
    for (const topic of topics) {
      if (!topic.topic_name || !topic.topic_name.trim()) {
        return NextResponse.json(
          { success: false, message: "Topic name cannot be empty" },
          { status: 400 },
        );
      }
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update subject name
      await tx.subjects.update({
        where: { subject_id: subjectId },
        data: { subject_name },
      });

      // 2️⃣ Fetch existing topics
      const existingTopics = await tx.topics.findMany({
        where: { subject_id: subjectId },
        include: {
          _count: { select: { questions: true } },
        },
      });

      // 3️⃣ Delete removed topics ONLY if they have no questions
      for (const existing of existingTopics) {
        const stillExists = topics.find(
          (t: any) => t.topic_id === existing.topic_id,
        );
        if (!stillExists && existing._count.questions === 0) {
          await tx.topics.delete({
            where: { topic_id: existing.topic_id },
          });
        }
      }

      // 4️⃣ Update existing topics
      for (const topic of topics) {
        if (topic.topic_id) {
          await tx.topics.update({
            where: { topic_id: topic.topic_id },
            data: { topic_name: topic.topic_name },
          });
        }
      }

      // 5️⃣ Create new topics
      for (const topic of topics) {
        if (!topic.topic_id) {
          await tx.topics.create({
            data: { subject_id: subjectId, topic_name: topic.topic_name },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully",
    });
  } catch (error: any) {
    console.error("❌ PUT /subjects error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Subject name already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update subject" },
      { status: 500 },
    );
  }
}

// ----------------------
// DELETE - Delete subject + topics
// ----------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = Number(searchParams.get("id"));

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Subject ID is required" },
        { status: 400 },
      );
    }

    // 🔒 Check if ANY topic has questions
    const usedTopics = await prisma.topics.count({
      where: {
        subject_id: subjectId,
        questions: { some: {} },
      },
    });

    if (usedTopics > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete subject. Some topics are associated with questions.",
        },
        { status: 400 },
      );
    }

    await prisma.subjects.delete({
      where: { subject_id: subjectId },
    });

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /subjects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 },
    );
  }
}
