"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  useTheme,
  Avatar,
  Chip,
} from "@mui/material";
// use CSS grid with Box for consistent layout and spacing
import { useRouter } from "next/navigation";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import StarRateIcon from "@mui/icons-material/StarRate";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EventIcon from "@mui/icons-material/Event";
import GradeIcon from "@mui/icons-material/Grade";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const MAIN_BG = "#f5f7fa";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#e0e0e0";
const TEXT_SECONDARY = "#64748b";
const TEXT_PRIMARY = "#1e293b";
const PRIMARY_PURPLE = "#2f13c9ff";
const SUCCESS_GREEN = "#22c55e";
const WARNING_YELLOW = "#f59e0b";
const DANGER_RED = "#ef4444";
const INFO_BLUE = "#2679d9ff";
const EXAM_META_COLOR = TEXT_SECONDARY;

// Shared action button sizing and styles so all action buttons look identical
const ACTION_BUTTON_MD_WIDTH = "160px";
const ACTION_BUTTON_SX = {
  // horizontal padding kept for visual spacing; height and lineHeight enforce identical vertical size
  padding: "0 14px",
  height: "40px",
  lineHeight: "40px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textTransform: "none",
  backgroundColor: PRIMARY_PURPLE,
  color: "#fff",
  borderRadius: 2,
  fontSize: "15px",
  fontWeight: 700,
  boxShadow: "none",
};

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  iconColor?: string;
}

const StatCard = ({ icon, label, value, color, iconColor }: StatCardProps) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      flex: { xs: "1 1 100%", sm: "1 1 50%", md: "1 1 240px" },
      display: "flex",
      alignItems: "center",
      transition: "all 0.3s ease",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.875 }}>
      <Avatar
        sx={{
          width: 60,
          height: 60,
          bgcolor: color,
          color: iconColor || "#fff",
          fontSize: "24px",
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1,
            mb: 0.625,
            color: TEXT_PRIMARY,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ color: "#7f8c8d", fontSize: 14 }}>{label}</Typography>
      </Box>
    </Box>
  </Card>
);

interface ExamMeta {
  duration: string | number;
  questions: string | number;
  due: string;
  points: string | number;
  examType: "practice" | "mock" | "live";
}

interface ExamCardProps {
  title: string;
  subject: string;
  meta: ExamMeta;
  onStart?: () => void;
}

interface CompletedExam {
  title: string;
  subject: string;
  scorePercentage: number;
  completionDate: string;
  duration: string;
  questions: string;
  scoreFraction: string;
  examType: string;
}

// Helper to format date and time
const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ExamCard = ({ title, subject, meta, timeRemaining, startDate, endDate }: ExamCardProps & { timeRemaining?: string; startDate?: string; endDate?: string }) => (
  <Card
    sx={{
      border: `1px solid #e0e0e0`,
      borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      width: "100%",
      overflow: "hidden",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.5, md: 1.875 },
        background: "#f8f9fa",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 16, sm: 17, md: 18 },
            fontWeight: 600,
            mb: { xs: 0.25, sm: 0.5, md: 0.625 },
            color: "#2c3e50",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: "#7f8c8d",
            fontSize: { xs: 13, sm: 14 },
          }}
        >
          {subject}
        </Typography>
      </Box>
      <Typography
        sx={{
          backgroundColor:
            meta.examType === "practice"
              ? "#3b82f6"
              : meta.examType === "mock"
                ? "#f59e0b"
                : "#ef4444",
          color: "#fff",
          borderRadius: "12px",
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {meta.examType}
      </Typography>
    </Box>
    <Box sx={{ p: { xs: 1.25, sm: 1.5, md: 1.875 } }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          mb: { xs: 1.25, sm: 1.5, md: 1.875 },
          gap: { xs: 0.5, sm: 0.75 },
        }}
      >
        <Box
          sx={{
            flex: { xs: "1 0 100%", sm: "1 0 50%" },
            mb: { xs: 0.75, sm: 1, md: 1.25 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 0.625 },
          }}
        >
          <AccessTimeIcon fontSize="small" sx={{ color: "#6a11cb" }} />
          <Typography
            variant="body2"
            sx={{ color: TEXT_PRIMARY, fontSize: { xs: 13, sm: 14 } }}
          >
            {meta.duration} min
          </Typography>
        </Box>
        <Box
          sx={{
            flex: { xs: "1 0 100%", sm: "1 0 50%" },
            mb: { xs: 0.75, sm: 1, md: 1.25 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 0.625 },
          }}
        >
          <HelpOutlineIcon fontSize="small" sx={{ color: "#6a11cb" }} />
          <Typography
            variant="body2"
            sx={{
              color: TEXT_PRIMARY,
              fontSize: { xs: 13, sm: 14 },
            }}
          >
            {meta.questions} questions
          </Typography>
        </Box>

        {meta.examType === "live" && startDate && endDate && (
          <>
            <Box
              sx={{
                flex: { xs: "1 0 100%", sm: "1 0 50%" },
                mb: { xs: 0.75, sm: 1, md: 1.25 },
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0.625 },
              }}
            >
              <EventIcon fontSize="small" sx={{ color: "#6a11cb" }} />
              <Typography
                variant="body2"
                sx={{
                  color: TEXT_PRIMARY,
                  fontSize: { xs: 13, sm: 14 },
                }}
              >
                Start: {formatDateTime(startDate)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: { xs: "1 0 100%", sm: "1 0 50%" },
                mb: { xs: 0.75, sm: 1, md: 1.25 },
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0.625 },
              }}
            >
              <EventIcon fontSize="small" sx={{ color: "#6a11cb" }} />
              <Typography
                variant="body2"
                sx={{
                  color: TEXT_PRIMARY,
                  fontSize: { xs: 13, sm: 14 },
                }}
              >
                End: {formatDateTime(endDate)}
              </Typography>
            </Box>
          </>
        )}

        <Box
          sx={{
            flex: { xs: "1 0 100%", sm: "1 0 50%" },
            mb: { xs: 0.75, sm: 1, md: 1.25 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 0.625 },
          }}
        >
          <GradeIcon fontSize="small" sx={{ color: "#6a11cb" }} />
          <Typography
            variant="body2"
            sx={{
              color: TEXT_PRIMARY,
              fontSize: { xs: 13, sm: 14 },
            }}
          >
            {meta.points} points
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Chip
          sx={{
            background: timeRemaining ? "#fef3c7" : "#e6f4ea",
            color: timeRemaining ? "#d97706" : "#137333",
            borderRadius: "20px",
            padding: { xs: "4px 8px", sm: "5px 10px" },
            fontSize: { xs: 11, sm: 12 },
            fontWeight: 600,
          }}
          label={timeRemaining || "Available"}
          size="small"
        />
      </Box>
    </Box>
  </Card>
);

const CompletedExamCard = ({
  exam,
  onView,
}: {
  exam: CompletedExam;
  onView?: () => void;
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "#28a745";
    if (score >= 70) return "#ffc107";
    return "#dc3545";
  };

  const scoreColor = getScoreColor(exam.scorePercentage);
  return (
    <Card
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
        background: "#ffffff",
        color: TEXT_PRIMARY,
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        width: "100%",
        overflow: "hidden",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.25, sm: 1.5, md: 1.875 },
          background: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          borderTopLeftRadius: { xs: "6px", sm: "8px", md: "10px" },
          borderTopRightRadius: { xs: "6px", sm: "8px", md: "10px" },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 16, sm: 17, md: 18 },
              fontWeight: 600,
              mb: { xs: 0.25, sm: 0.5, md: 0.625 },
              color: "#2c3e50",
              lineHeight: 1.2,
            }}
          >
            {exam.title}
          </Typography>
          <Typography
            sx={{
              color: "#7f8c8d",
              fontSize: { xs: 13, sm: 14 },
            }}
          >
            {exam.subject}
          </Typography>
        </Box>
        <Typography
          sx={{
            backgroundColor:
              exam.examType === "practice"
                ? "#3b82f6"
                : exam.examType === "mock"
                  ? "#f59e0b"
                  : "#ef4444",
            color: "#fff",
            borderRadius: "12px",
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {exam.examType}
        </Typography>
      </Box>
      <Box sx={{ p: { xs: 1, sm: 1.25, md: 1.5 } }}>
        <Typography
          sx={{
            fontSize: { xs: 16, sm: 17, md: 18 },
            fontWeight: 600,
            textAlign: "center",
            mb: { xs: 0.75, sm: 1 },
            color: scoreColor,
          }}
        >
          {parseInt(exam.scoreFraction.split("/")[0])}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mb: { xs: 0.75, sm: 1 },
            gap: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Box
            sx={{
              flex: { xs: "1 0 100%", sm: "1 0 50%" },
              mb: { xs: 0.5, sm: 0.75 },
              display: "flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <CalendarTodayIcon fontSize="small" sx={{ color: "#6a11cb" }} />
            <Typography
              variant="body2"
              sx={{
                color: TEXT_PRIMARY,
                fontSize: { xs: 13, sm: 14 },
              }}
            >
              Completed: {exam.completionDate}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: { xs: "1 0 100%", sm: "1 0 50%" },
              mb: { xs: 0.5, sm: 0.6 },
              display: "flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <AccessTimeIcon fontSize="small" sx={{ color: "#6a11cb" }} />
            Duration: {exam.duration} min
          </Box>
          <Box
            sx={{
              flex: { xs: "1 0 100%", sm: "1 0 50%" },
              mb: { xs: 0.5, sm: 0.6 },
              display: "flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <HelpOutlineIcon fontSize="small" sx={{ color: "#6a11cb" }} />
            <Typography
              variant="body2"
              sx={{
                color: TEXT_PRIMARY,
                fontSize: { xs: 13, sm: 14 },
              }}
            >
              Questions: {exam.questions}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: { xs: 1, sm: 1.25, md: 1.5 }, mt: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Chip
            label="Completed"
            sx={{
              background: "#e8f0ff",
              color: "#2b6cb0",
              borderRadius: "16px",
              padding: { xs: "3px 6px", sm: "4px 8px" },
              fontSize: { xs: 11, sm: 12 },
              alignSelf: { xs: "stretch", sm: "auto" },
              textAlign: "center",
            }}
            size="small"
          />

          <Box
            sx={{
              width: { xs: "100%", sm: ACTION_BUTTON_MD_WIDTH },
              display: "flex",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={{
                padding: { xs: "6px 12px", sm: "8px 15px" },
                height: { xs: "36px", sm: "40px" },
                lineHeight: { xs: "36px", sm: "40px" },
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "none",
                background: "#28a745",
                color: "#fff",
                borderRadius: 2,
                fontSize: { xs: "13px", sm: "14px" },
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { transform: "translateY(-2px)" },
              }}
              onClick={onView}
            >
              View Results
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const ActionCard = ({ button }: { button: ReactNode }) => (
  <Card
    sx={{
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 2,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: "100%",
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
      },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
    }}
  >
    {button}
  </Card>
);

export default function StudentDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [upcomingLiveExams, setUpcomingLiveExams] = useState<any[]>([]);
  const [completedExams, setCompletedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to calculate time remaining
  const getTimeRemaining = (startDateString: string) => {
    if (!startDateString) return "Available soon";
    
    const now = new Date();
    const startDate = new Date(startDateString);
    const timeRemaining = startDate.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return "Exam starting now";
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  useEffect(() => {
    // Check if user is logged in and is student
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");

    if (!token || role !== "student") {
      router.push("/");
      return;
    }

    const fetchExams = async () => {
      try {
        // Fetch available exams
        const availableResponse = await fetch("/api/students/exams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const availableData = await availableResponse.json();
         if (availableData.success) {
          // Filter to show practice, mock, and currently live exams (available now)
          const practiceMockLiveExams = availableData.data.filter(
            (exam: any) => 
              exam.examType === "practice" || 
              exam.examType === "mock" || 
              (exam.examType === "live" && exam.state === "available"),
          );
          setAvailableExams(practiceMockLiveExams);

          // Filter to show only upcoming live exams
          const upcomingLive = availableData.data.filter(
            (exam: any) => exam.examType === "live" && exam.state === "upcoming",
          );
          setUpcomingLiveExams(upcomingLive);
        }

        // Fetch completed exams
        const completedResponse = await fetch("/api/students/attempts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const completedData = await completedResponse.json();
        if (completedData.success) {
          setCompletedExams(completedData.data);
        }
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();

    const mediaQuery = globalThis.matchMedia(theme.breakpoints.down("md"));
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme.breakpoints, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2, md: 2.5 },
        color: TEXT_PRIMARY,
        background: MAIN_BG,
        minHeight: "100vh",
        p: { xs: 1.5, sm: 2.5, md: 3.75 },
      }}
    >
      {/* Top Stats */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 3.75 } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          <StatCard
            icon={<AssignmentIcon />}
            label="Available Exams"
            value={availableExams.length}
            color={"#e6f4ea"}
            iconColor={"#137333"}
          />
          <StatCard
            icon={<CheckCircleIcon />}
            label="Completed Exams"
            value={completedExams.length}
            color={"#e8f0fe"}
            iconColor={"#1a73e8"}
          />
          <StatCard
            icon={<ScheduleIcon />}
            label="Pending Results"
            value="2"
            color={"#fef7e0"}
            iconColor={"#e37400"}
          />
          <StatCard
            icon={<StarRateIcon />}
            label="Average Score"
            value="82%"
            color={"#fce8e6"}
            iconColor={"#c5221f"}
          />
        </Box>
      </Box>

      {/* Available Exams */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 3.75 } }}>
        <Card
          sx={{
            background: CARD_BG,
            borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
            p: { xs: 2, sm: 2.5, md: 3.125 },
            transition: "all 0.3s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 1.5, sm: 2, md: 2.5 },
              pb: { xs: 1, sm: 1.5, md: 1.875 },
              borderBottom: `2px solid #f0f0f0`,
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: "#2c3e50",
                fontSize: { xs: 18, sm: 19, md: 20 },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Available Exams
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                padding: { xs: "8px 16px", sm: "10px 20px" },
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 600,
                borderRadius: 2,
                mt: { xs: 0, sm: 0 },
                background: "transparent",
                alignSelf: { xs: "stretch", sm: "auto" },
              }}
              onClick={() => router.push("/student-pages/my_exams")}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              alignItems: "start",
            }}
          >
            {loading ? (
              <Typography>Loading exams...</Typography>
            ) : availableExams.length > 0 ? (
              availableExams.slice(0, 6).map((exam) => (
                <Box
                  key={exam.id}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "1 1 280px", md: "1 1 300px" },
                  }}
                >
                  <ExamCard
                    title={exam.title}
                    subject={exam.subject}
                    meta={{
                      duration: exam.duration ?? 0,
                      questions: exam.questions ?? 0,
                      due: exam.endDate ? formatDate(exam.endDate) : "",
                      points: exam.points ?? 0,
                      examType: exam.examType,
                    }}
                    startDate={exam.startDate}
                    endDate={exam.endDate}
                  />
                </Box>
              ))
            ) : (
              <Typography>No available exams at the moment.</Typography>
            )}
          </Box>
        </Card>
      </Box>

      {/* Upcoming Live Exams */}
      <Box sx={{ mb: 3.75 }}>
        <Card
          sx={{
            background: CARD_BG,
            borderRadius: 2.5,
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
            p: 3.125,
            transition: "all 0.3s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              pb: 1.875,
              borderBottom: `2px solid #f0f0f0`,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#2c3e50", fontSize: 20 }}
            >
              Upcoming Live Exams
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: 2,
                mt: isMobile ? 1 : 0,
                background: "transparent",
              }}
              onClick={() => router.push("/student-pages/my_exams")}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            {loading ? (
              <Typography>Loading upcoming exams...</Typography>
            ) : upcomingLiveExams.length > 0 ? (
              upcomingLiveExams.slice(0, 6).map((exam: any) => (
                <Box
                  key={exam.id}
                  sx={{ flex: { xs: "1 1 100%", sm: "1 1 300px" } }}
                >
                  <ExamCard
                    title={exam.title}
                    subject={exam.subject}
                    meta={{
                      duration: exam.duration ?? 0,
                      questions: exam.questions ?? 0,
                      due: exam.startDate ? formatDate(exam.startDate) : "",
                      points: exam.points ?? 0,
                      examType: exam.examType,
                    }}
                    timeRemaining={getTimeRemaining(exam.startDate)}
                    startDate={exam.startDate}
                    endDate={exam.endDate}
                  />
                </Box>
              ))
            ) : (
              <Typography>No upcoming live exams at the moment.</Typography>
            )}
          </Box>
        </Card>
      </Box>

      {/* Completed Exams */}
      <Box sx={{ mb: 3.75 }}>
        <Card
          sx={{
            background: CARD_BG,
            borderRadius: 2.5,
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
            p: 3.125,
            transition: "all 0.3s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              pb: 1.875,
              borderBottom: `2px solid #f0f0f0`,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: "#2c3e50", fontSize: 20 }}
            >
              Completed Exams
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: 2,
                mt: isMobile ? 1 : 0,
                background: "transparent",
              }}
              onClick={() => router.push("/student-pages/exam_history")}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            {loading ? (
              <Typography>Loading completed exams...</Typography>
            ) : completedExams.length > 0 ? (
              completedExams.slice(0, 6).map((exam: any) => (
                <Box
                  key={exam.attemptId}
                  sx={{ flex: { xs: "1 1 100%", sm: "1 1 300px" } }}
                >
                  <CompletedExamCard
                    exam={{
                      title: exam.title,
                      subject: exam.subject,
                      scorePercentage: Math.round(
                        (parseInt(exam.score) / parseInt(exam.points)) * 100,
                      ),
                      completionDate: exam.completedAt,
                      duration: exam.duration ?? 0,

                      questions: exam.questions.toString(),
                      scoreFraction: `${parseInt(exam.score)}/${parseInt(exam.points)}`,
                      examType: exam.examType,
                    }}
                    onView={() =>
                      router.push(
                        `/student-pages/exam_res_rev?attemptId=${exam.attemptId}`,
                      )
                    }
                  />
                </Box>
              ))
            ) : (
              <Typography>No completed exams yet.</Typography>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
