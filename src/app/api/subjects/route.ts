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
          select: {
            topic_id: true,
            topic_name: true,
          },
        },
      },
      orderBy: { subject_name: "asc" },
    });

    // Add topic count dynamically
    const formattedSubjects = subjects.map((subject) => ({
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      topic_count: subject.topics.length,
      topics: subject.topics,
      created_at: subject.created_at,
    }));

    return NextResponse.json({ success: true, data: formattedSubjects });
  } catch (error) {
    console.error("❌ GET /subjects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subjects" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Subject name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// ----------------------
// PUT - Update subject + topics (FIXED)
// ----------------------
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("id");

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Subject ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    await createSubjectSchema.validate(body, { abortEarly: false });

    const { subject_name, topics } = body;

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update subject name
      await tx.subjects.update({
        where: { subject_id: Number(subjectId) },
        data: { subject_name },
      });

      // 2️⃣ Delete old topics
      await tx.topics.deleteMany({
        where: { subject_id: Number(subjectId) },
      });

      // 3️⃣ Re-create topics (SAFE WAY)
      for (const topicName of topics) {
        await tx.topics.create({
          data: {
            subject_id: Number(subjectId),
            topic_name: topicName,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully",
    });
  } catch (error: any) {
    console.error("❌ PUT /subjects error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Subject name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// ----------------------
// DELETE - Delete subject + topics
// ----------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("id");

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Subject ID is required" },
        { status: 400 }
      );
    }

    await prisma.subjects.delete({
      where: { subject_id: Number(subjectId) },
    });

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /subjects error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
