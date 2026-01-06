import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get question counts for subjects
    const subjectCounts = await prisma.questions.groupBy({
      by: ['subject_id'],
      _count: true,
    });

    // Get question counts for topics
    const topicCounts = await prisma.questions.groupBy({
      by: ['topic_id'],
      _count: true,
    });

    const counts: { [key: string]: number } = {};

    subjectCounts.forEach(sc => {
      counts[`subject_${sc.subject_id}`] = sc._count;
    });

    topicCounts.forEach(tc => {
      counts[`topic_${tc.topic_id}`] = tc._count;
    });

    return NextResponse.json(counts);
  } catch (err) {
    console.error("Error fetching question counts:", err);
    return NextResponse.json({
      success: false,
      error: "Error fetching question counts",
    });
  }
}