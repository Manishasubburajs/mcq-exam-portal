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

    // DATE FILTER (same IST logic you used before)
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
        accuracy: true,
        start_time: true,
      },
    });

    const performanceMap: any = {};

    attempts.forEach((a) => {
      const date = new Date(a.start_time).toISOString().split("T")[0];

      if (!performanceMap[date]) {
        performanceMap[date] = {
          totalAccuracy: 0,
          count: 0,
        };
      }

      performanceMap[date].totalAccuracy += Number(a.accuracy || 0);
      performanceMap[date].count += 1;
    });

    // CALCULATE AVERAGE
    Object.keys(performanceMap).forEach((date) => {
      const item = performanceMap[date];
      item.avgAccuracy = item.totalAccuracy / item.count;
    });

    // GENERATE DATE RANGE
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
      allDates.push(d.toISOString().split("T")[0]);
    }

    // FILL MISSING DATES
    allDates.forEach((date) => {
      if (!performanceMap[date]) {
        performanceMap[date] = {
          avgAccuracy: 0,
        };
      }
    });

    let finalMap = performanceMap;

    // WEEK GROUPING FOR 3 MONTHS
    if (dateRange === "quarter") {
      const weeklyMap: any = {};

      Object.keys(performanceMap).forEach((date) => {
        const d = new Date(date);

        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());

        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyMap[weekKey]) {
          weeklyMap[weekKey] = {
            total: 0,
            count: 0,
          };
        }

        weeklyMap[weekKey].total += performanceMap[date].avgAccuracy;
        weeklyMap[weekKey].count += 1;
      });

      Object.keys(weeklyMap).forEach((week) => {
        weeklyMap[week].avgAccuracy =
          weeklyMap[week].total / weeklyMap[week].count;
      });

      finalMap = weeklyMap;
    }

    const sortedDates = Object.keys(finalMap).sort();

    const labels = sortedDates.map((d) =>
      new Date(d).toLocaleDateString("en-GB"),
    );

    const weekRanges =
      dateRange === "quarter"
        ? sortedDates.map((d) => {
            const start = new Date(d);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            return `${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString(
              "en-GB",
            )}`;
          })
        : [];

    const data = sortedDates.map((d) =>
      Number(finalMap[d].avgAccuracy?.toFixed(2) || 0),
    );

    return NextResponse.json({
      labels,
      data,
      weekRanges,
    });
  } catch (error) {
    console.error("Performance Trend Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch performance trend" },
      { status: 500 },
    );
  }
}
