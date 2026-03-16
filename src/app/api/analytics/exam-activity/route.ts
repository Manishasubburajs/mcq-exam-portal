export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const examType = searchParams.get("examType");
    const examId = searchParams.get("examId");
    const dateRange = searchParams.get("dateRange");

    const where: any = {
      status: "completed",
    };

    // DATE FILTER
    if (dateRange) {
      const IST_OFFSET = 5 * 60 + 30;

      const nowUTC = new Date();
      const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60 * 1000);

      let startDateIST = new Date(nowIST);

      if (dateRange === "week") startDateIST.setDate(nowIST.getDate() - 7);
      else if (dateRange === "month")
        startDateIST.setMonth(nowIST.getMonth() - 1);
      else if (dateRange === "quarter")
        startDateIST.setMonth(nowIST.getMonth() - 3);

      const startDateUTC = new Date(
        startDateIST.getTime() - IST_OFFSET * 60 * 1000,
      );

      where.start_time = { gte: startDateUTC };
    }

    // EXAM FILTER
    if (examId && examId !== "all") {
      where.exam_id = Number(examId);
    }

    // EXAM TYPE FILTER
    if (examType && examType !== "all") {
      where.exam = {
        is: {
          exam_type: examType,
        },
      };
    }

    const attempts = await prisma.student_exam_attempts.findMany({
      where,
      select: {
        student_id: true,
        exam_id: true,
        start_time: true,
        exam: {
          select: {
            exam_type: true,
            exam_title: true,
          },
        },
      },
    });

    // REMOVE DUPLICATE ATTEMPTS
    const uniqueMap = new Map();

    attempts.forEach((a) => {
      const date = new Date(a.start_time).toISOString().split("T")[0];

      const key = `${a.student_id}-${a.exam_id}-${date}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          date,
          examType: a.exam.exam_type,
          examTitle: a.exam.exam_title,
        });
      }
    });

    let activityMap: any = {};

    uniqueMap.forEach((item) => {
      const date = item.date;

      if (!activityMap[date]) {
        activityMap[date] = {
          live: 0,
          mock: 0,
          practice: 0,
        };
      }

      if (item.examType === "live") activityMap[date].live += 1;
      if (item.examType === "mock") activityMap[date].mock += 1;
      if (item.examType === "practice") activityMap[date].practice += 1;
    });

    // GENERATE ALL DATES IN RANGE
    const allDates: string[] = [];

    const startDate = where.start_time?.gte
      ? new Date(where.start_time.gte)
      : new Date();

    const endDate = new Date();

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      allDates.push(dateStr);
    }

    // FILL MISSING DATES WITH 0
    allDates.forEach((date) => {
      if (!activityMap[date]) {
        activityMap[date] = {
          live: 0,
          mock: 0,
          practice: 0,
        };
      }
    });

    // GROUP BY WEEK IF QUARTER
    if (dateRange === "quarter") {
      const weeklyMap: any = {};

      Object.keys(activityMap).forEach((date) => {
        const d = new Date(date);

        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());

        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyMap[weekKey]) {
          weeklyMap[weekKey] = {
            live: 0,
            mock: 0,
            practice: 0,
          };
        }

        weeklyMap[weekKey].live += activityMap[date].live;
        weeklyMap[weekKey].mock += activityMap[date].mock;
        weeklyMap[weekKey].practice += activityMap[date].practice;
      });

      activityMap = weeklyMap;
    }

    // const sortedDates = allDates;
    const sortedDates = Object.keys(activityMap).sort();

    const labels: string[] = [];
    const ranges: string[] = [];

    sortedDates.forEach((d) => {
      const start = new Date(d);

      if (dateRange === "quarter") {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const startStr = start.toLocaleDateString("en-GB");
        const endStr = end.toLocaleDateString("en-GB");

        labels.push(startStr); // short label
        ranges.push(`${startStr} - ${endStr}`); // tooltip range
      } else {
        const dateStr = start.toLocaleDateString("en-GB");

        labels.push(dateStr);
        ranges.push(dateStr);
      }
    });

    const liveData = sortedDates.map((d) => activityMap[d].live);
    const mockData = sortedDates.map((d) => activityMap[d].mock);
    const practiceData = sortedDates.map((d) => activityMap[d].practice);

    return NextResponse.json({
      labels,
      ranges,
      datasets: {
        live: liveData,
        mock: mockData,
        practice: practiceData,
      },
    });
  } catch (error) {
    console.error("Exam Activity Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch exam activity" },
      { status: 500 },
    );
  }
}
