import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/questions/subject-topics-counts
 * Returns:
 * [
 *   {
 *     subject_id,
 *     subject_name,
 *     topics: [
 *       { topic_id, topic_name, question_count }
 *     ]
 *   }
 * ]
 */
export async function GET() {
  try {
    // Fetch all subjects with topics and questions
    const subjects = await prisma.subjects.findMany({
      include: {
        topics: {
          include: {
            questions: true,
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
        question_count: topic.questions.length,
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
