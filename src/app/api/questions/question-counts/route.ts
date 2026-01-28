import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const subjects = await prisma.subjects.findMany({
      include: {
        topics: {
          include: {
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },
      orderBy: { subject_name: "asc" },
    });

    const formatted = subjects.map((subj) => ({
      subject_id: subj.subject_id,
      subject_name: subj.subject_name,
      topics: subj.topics.map((topic) => ({
        topic_id: topic.topic_id,
        topic_name: topic.topic_name,
        question_count: topic._count.questions,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching subject/topic counts:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject/topic counts" },
      { status: 500 }
    );
  }
}
