"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  SubTitle,
} from "chart.js";
// cSpell:ignore chartjs
import { Bar, Line } from "react-chartjs-2";

import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import ChartContainer from "../components/ChartContainer";

const Header = dynamic(() => import("../components/Header"), { ssr: false });

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  SubTitle,
);

export default function Home() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const isMobile = useMediaQuery("(max-width:767px)");
  const isTablet = useMediaQuery("(min-width:768px) and (max-width:1023px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [examActivityData, setExamActivityData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [performanceTrend, setPerformanceTrend] = useState<any>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const [stats, setStats] = useState([
    {
      title: "0",
      subtitle: "Total Students",
      icon: "School",
      color: "white",
      bgColor: "linear-gradient(135deg, #4caf50, #66bb6a)",
    },
    {
      title: "0",
      subtitle: "Total Exams",
      icon: "Assignment",
      color: "white",
      bgColor: "linear-gradient(135deg, #2196f3, #42a5f5)",
    },
    {
      title: "0",
      subtitle: "Questions in Bank",
      icon: "HelpOutline",
      color: "white",
      bgColor: "linear-gradient(135deg, #ff9800, #ffb74d)",
    },
    {
      title: "0%",
      subtitle: "Total Subjects",
      icon: "Book",
      color: "white",
      bgColor: "linear-gradient(135deg, #f44336, #ef5350)",
    },
  ]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch students count
      const studentsRes = await fetch("/api/students");
      const studentsData = await studentsRes.json();
      let studentCount = 0;
      if (studentsData.success) {
        studentCount = studentsData.data.length;
      }

      // Fetch exams count
      const examsRes = await fetch("/api/exams");
      const examsData = await examsRes.json();
      let activeExamsCount = 0;
      if (Array.isArray(examsData)) {
        activeExamsCount = examsData.filter(
          (exam: any) => exam.status === "active",
        ).length;
      }

      // Fetch questions count
      const questionsRes = await fetch("/api/questions");
      const questionsData = await questionsRes.json();
      let totalQuestions = 0;
      if (Array.isArray(questionsData)) {
        totalQuestions = questionsData.length;
      }

      // Fetch subjects count
      const subjectsRes = await fetch("/api/subjects");
      const subjectsData = await subjectsRes.json();
      let totalSubjects = 0;
      if (subjectsData.success && Array.isArray(subjectsData.data)) {
        totalSubjects = subjectsData.data.length;
      }

      setStats((prevStats) =>
        prevStats.map((stat) => {
          if (stat.subtitle === "Total Students") {
            return { ...stat, title: studentCount.toString() };
          } else if (stat.subtitle === "Total Exams") {
            return { ...stat, title: activeExamsCount.toString() };
          } else if (stat.subtitle === "Questions in Bank") {
            return { ...stat, title: totalQuestions.toString() };
          } else if (stat.subtitle === "Total Subjects") {
            return { ...stat, title: totalSubjects.toString() };
          }
          return stat;
        }),
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamActivity = async () => {
    try {
      setChartLoading(true);

      const res = await fetch("/api/analytics/exam-activity?dateRange=week");
      const data = await res.json();

      setExamActivityData({
        labels: data.labels,
        datasets: [
          {
            label: "Live",
            data: data.datasets.live,
            backgroundColor: theme.palette.error.main,
          },
          {
            label: "Mock",
            data: data.datasets.mock,
            backgroundColor: theme.palette.secondary.main,
          },
          {
            label: "Practice",
            data: data.datasets.practice,
            backgroundColor: theme.palette.primary.main,
          },
        ],
      });
    } catch (error) {
      console.error("Dashboard chart error:", error);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchPerformanceTrend = async () => {
    try {
      setTrendLoading(true);

      const res = await fetch(
        `/api/analytics/performance-trend?dateRange=week`,
      );
      const data = await res.json();

      setPerformanceTrend({
        labels: data.labels,
        datasets: [
          {
            label: "Average Accuracy %",
            data: data.data,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch performance trend:", error);
    } finally {
      setTrendLoading(false);
    }
  };

  const getExamChartSubtitle = () => {
    return "Exam activity for the last 7 days";
  };

  const getPerformChartSubtitle = () => {
    return "Average accuracy for last 7 days";
  };

  useEffect(() => {
    // Check if user is logged in and is admin
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");

    if (!token || role !== "admin") {
      router.push("/");
      return;
    }

    setSidebarOpen(isDesktop);
    fetchStats();
    fetchExamActivity();
    fetchPerformanceTrend();
  }, [isDesktop, isTablet, router]);

  const examActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 9 } },
      },
      x: { ticks: { font: { size: 9 } } },
    },
    plugins: {
      legend: { display: true, position: "bottom" as const },
      subtitle: {
        display: true,
        text: getExamChartSubtitle(),
        font: { size: 11 },
        padding: { bottom: 10 },
        color: "#6b7280",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw} exams taken`;
          },
        },
      },
    },
  };

  const performanceTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { size: 9 },
        },
      },
      x: {
        ticks: {
          font: { size: 9 },
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      subtitle: {
        display: true,
        text: getPerformChartSubtitle(),
        font: { size: 11 },
        padding: { bottom: 10 },
        color: "#6b7280",
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Accuracy: ${context.raw}%`;
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "grey.50" }}
    >
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && (isMobile || isTablet) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box
        className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        sx={{
          ml: sidebarOpen && isDesktop ? "220px" : 0,
          transition: "margin-left 0.3s ease",
          pt: { xs: "50px", md: "80px" },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Stats Cards */}
        <Box sx={{ mt: 4 }}>
          <div className="stats-grid">
            {stats.map((stat) => (
              <StatsCard key={stat.subtitle} stat={stat} loading={loading} />
            ))}
          </div>
        </Box>

        {/* Charts */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(2, 1fr)",
            },
            gap: { xs: 2, sm: 2, md: 3 },
            mb: 4,
          }}
        >
          <ChartContainer
            title="Exam Activity Overview"
            minHeight={{ xs: 240, sm: 300, md: 380 }}
          >
            {chartLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography>Loading chart...</Typography>
              </Box>
            ) : !examActivityData ||
              !examActivityData.labels?.length ||
              !examActivityData.datasets?.some((d: any) => d.data?.length) ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                No exam activity available 
              </Box>
            ) : (
              <Bar
                data={
                  examActivityData || {
                    labels: [],
                    datasets: [],
                  }
                }
                options={examActivityOptions}
              />
            )}
          </ChartContainer>

          <ChartContainer
            title="Performance Trend"
            minHeight={{ xs: 240, sm: 300, md: 380 }}
          >
            {trendLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography>Loading chart...</Typography>
              </Box>
            ) : !performanceTrend ||
              !performanceTrend.labels?.length ||
              !performanceTrend.datasets?.[0]?.data?.length ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                No performance data available
              </Box>
            ) : (
              <Line
                data={
                  performanceTrend || {
                    labels: [],
                    datasets: [],
                  }
                }
                options={performanceTrendOptions}
              />
            )}
          </ChartContainer>
        </Box>
      </Box>
    </Box>
  );
}
