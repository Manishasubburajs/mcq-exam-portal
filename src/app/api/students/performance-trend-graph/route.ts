import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

export async function GET(req: NextRequest) {
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
    const examType = searchParams.get("examType"); // all | practice | mock | live
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // ---------------- DATE FILTER ----------------
    const dateFilter: any = {};

    if (fromDate) {
      dateFilter.gte = new Date(fromDate);
    }

    if (toDate) {
      dateFilter.lte = new Date(toDate);
    }

    // ---------------- QUERY ----------------
    const attempts = await prisma.student_exam_attempts.findMany({
      where: {
        student_id: studentId,
        status: "completed",

        ...(fromDate || toDate
          ? {
              end_time: dateFilter,
            }
          : {}),

        ...(examType && examType !== "all"
          ? {
              exam: {
                exam_type: examType as any,
              },
            }
          : {}),
      },

      select: {
        attempt_id: true,
        accuracy: true,
        end_time: true,
        attempt_number: true,
        exam_id: true,
        exam: {
          select: {
            exam_type: true,
            exam_title: true,
          },
        },
      },

      orderBy: {
        end_time: "asc",
      },
    });

     // ---------------- FILTER LATEST ATTEMPTS PER EXAM ----------------
  // For all exam types, only include the latest attempt per exam to avoid duplicates
  const examToLatestAttempt: Record<number, any> = {};
  
  attempts.forEach(attempt => {
    const examId = attempt.exam_id;
    
    // If we haven't seen this exam or this is a later attempt, update
    if (!examToLatestAttempt[examId] || attempt.attempt_number > examToLatestAttempt[examId].attempt_number) {
      examToLatestAttempt[examId] = attempt;
    }
  });
  
  const filteredAttempts = Object.values(examToLatestAttempt);

    // ---------------- FORMAT FOR GRAPH ----------------
    const graphData = filteredAttempts.map((a) => ({
      date: a.end_time,
      accuracy: Number(a.accuracy ?? 0),
      attempt: a.attempt_number,
      examType: a.exam.exam_type,
      title: a.exam.exam_title,
    }));

    return NextResponse.json({
      success: true,
      data: graphData,
    });
  } catch (error) {
    console.error("Performance Graph Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load performance graph" },
      { status: 500 }
    );
  }
}