// 📁 src/app/api/subjects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as yup from "yup";

const createSubjectSchema = yup.object({
  subject_name: yup.string().required("Subject name is required"),
  topics: yup.array().of(yup.string().required("Topic name is required")).min(1, "At least one topic is required")
});

// GET - Fetch all subjects with topic counts
export async function GET() {
  try {
    const subjects = await prisma.subjects.findMany({
      include: {
        topics: {
          select: {
            topic_id: true,
            topic_name: true,
          }
        }
      },
      orderBy: {
        subject_name: "asc",
      },
    });

    // Transform data to include topic count
    const formattedSubjects = subjects.map(subject => ({
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      topic_count: subject.topics.length,
      topics: subject.topics,
      created_at: subject.created_at,
    }));

    return NextResponse.json({ success: true, data: formattedSubjects });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load subjects" },
      { status: 500 }
    );
  }
}

// POST - Create new subject with topics
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    await createSubjectSchema.validate(body, { abortEarly: false });

    const { subject_name, topics } = body;

    // Create subject with topics in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the subject first
      const subject = await tx.subjects.create({
        data: {
          subject_name,
        },
      });

      // Create all topics for this subject
      const topicCreates = topics.map((topicName: string) =>
        tx.topics.create({
          data: {
            subject_id: subject.subject_id,
            topic_name: topicName,
          },
        })
      );

      await Promise.all(topicCreates);

      // Update topic count
      await tx.subjects.update({
        where: { subject_id: subject.subject_id },
        data: { topic_count: topics.length },
      });

      return subject;
    });

    return NextResponse.json({
      success: true,
      message: "Subject created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating subject:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    // Handle duplicate subject name
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

// PUT - Update subject and its topics
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
    
    // Validate input
    await createSubjectSchema.validate(body, { abortEarly: false });

    const { subject_name, topics } = body;

    await prisma.$transaction(async (tx) => {
      // Update the subject name
      await tx.subjects.update({
        where: { subject_id: Number(subjectId) },
        data: { subject_name },
      });

      // Delete existing topics
      await tx.topics.deleteMany({
        where: { subject_id: Number(subjectId) },
      });

      // Create new topics
      const topicCreates = topics.map((topicName: string) =>
        tx.topics.create({
          data: {
            subject_id: Number(subjectId),
            topic_name: topicName,
          },
        })
      );

      await Promise.all(topicCreates);

      // Update topic count
      await tx.subjects.update({
        where: { subject_id: Number(subjectId) },
        data: { topic_count: topics.length },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating subject:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    // Handle duplicate subject name
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

// DELETE - Delete subject and its topics
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

    await prisma.$transaction(async (tx) => {
      // Delete all topics first (cascade will handle this, but being explicit)
      await tx.topics.deleteMany({
        where: { subject_id: Number(subjectId) },
      });

      // Delete the subject
      await tx.subjects.delete({
        where: { subject_id: Number(subjectId) },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
