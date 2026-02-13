"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Card, Button, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import StarRateIcon from "@mui/icons-material/StarRate";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EventIcon from "@mui/icons-material/Event";
import GradeIcon from "@mui/icons-material/Grade";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

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

interface ExamMeta {
  duration: string | number;
  questions: string | number;
  completedAt: string;
  points: string | number;
  score: string | number;
  examType: "practice" | "mock" | "live";
  attemptNumber?: number;
}

interface ExamCardProps {
  title: string;
  subject: string;
  meta: ExamMeta;
  onViewResults?: () => void;
  onTakeExam?: () => void;
  canRetake?: boolean;
}

const ExamCard = ({ title, subject, meta, onViewResults, onTakeExam, canRetake }: ExamCardProps) => (
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
            sx={{
              color: TEXT_PRIMARY,
              fontSize: { xs: 13, sm: 14 },
            }}
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

        <Box
          sx={{
            flex: { xs: "1 0 100%", sm: "1 0 50%" },
            mb: { xs: 0.75, sm: 1, md: 1.25 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 0.625 },
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
            Completed: {meta.completedAt}
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
          <GradeIcon fontSize="small" sx={{ color: "#6a11cb" }} />
          <Typography
            variant="body2"
            sx={{
              color: TEXT_PRIMARY,
              fontSize: { xs: 13, sm: 14 },
            }}
          >
            Score: {meta.score}/{meta.points}
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
          <StarRateIcon fontSize="small" sx={{ color: "#6a11cb" }} />
          <Typography
            variant="body2"
            sx={{
              color: TEXT_PRIMARY,
              fontSize: { xs: 13, sm: 14 },
            }}
          >
            Attempt: {meta.attemptNumber}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <Typography
            sx={{
              background: "#e6f4ea",
              color: "#137333",
              borderRadius: "20px",
              padding: { xs: "4px 8px", sm: "5px 10px" },
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 600,
            }}
          >
            Completed
          </Typography>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", sm: ACTION_BUTTON_MD_WIDTH },
            display: "flex",
            gap: canRetake ? 1 : 0,
          }}
        >
          <Button
            variant="contained"
            sx={{
              flex: canRetake ? 1 : "none",
              width: canRetake ? "auto" : "100%",
              padding: { xs: "6px 8px", sm: "8px 10px" },
              height: { xs: "36px", sm: "40px" },
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textTransform: "none",
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              color: "#fff",
              borderRadius: 2,
              fontSize: { xs: "10px", sm: "11px" },
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { transform: "translateY(-2px)" },
            }}
            onClick={onViewResults}
          >
            View Results
          </Button>
          {canRetake && (
            <Button
              variant="outlined"
              sx={{
                flex: 1,
                padding: { xs: "6px 8px", sm: "8px 10px" },
                height: { xs: "36px", sm: "40px" },
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "none",
                borderColor: "#6a11cb",
                color: "#6a11cb",
                borderRadius: 2,
                fontSize: { xs: "10px", sm: "11px" },
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#6a11cb",
                  color: "#fff",
                  transform: "translateY(-2px)"
                },
              }}
              onClick={onTakeExam}
            >
              Retake
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  </Card>
);

export default function ExamHistoryPage() {
  const router = useRouter();
  const theme = useTheme();
  const [completedExams, setCompletedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is student
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");

    if (!token || role !== "student") {
      router.push("/");
      return;
    }

    const fetchAttempts = async () => {
      try {
        const response = await fetch("/api/students/attempts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCompletedExams(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [router]);

  const viewResults = (attemptId: number) => {
    router.push(`/student-pages/exam_res_rev?attemptId=${attemptId}`);
  };

  const takeExam = async (attemptId: number, examId: number) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch("/api/students/retake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attemptId }),
      });
      const data = await response.json();
      if (data.success) {
        // Clear any existing violation flags for this exam before starting new attempt
        sessionStorage.removeItem(`violation_${examId}`);
        sessionStorage.removeItem("autoSubmit");
        // Remove any saved answers or question times for previous attempts
        sessionStorage.removeItem(`exam_${examId}_userAnswers`);
        sessionStorage.removeItem(`exam_${examId}_questionTimes`);
        
        router.push(`/student-pages/exam_taking?examId=${examId}&attemptId=${data.attemptId}`);
      } else {
        alert(data.message || "Failed to create retake");
      }
    } catch (error) {
      console.error("Failed to retake exam:", error);
      alert("Failed to retake exam");
    }
  };

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
      {/* Completed Exams */}
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
              Exam History
            </Typography>
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
              <Typography>Loading exam history...</Typography>
            ) : completedExams.length > 0 ? (
              completedExams.map((exam) => (
                <Box
                  key={exam.attemptId}
                  sx={{
                    flex: { xs: "1 1 100%", sm: "1 1 280px", md: "1 1 300px" },
                  }}
                >
                  <ExamCard
                    title={exam.title}
                    subject={exam.subject}
                    meta={{
                      duration: exam.duration.toString(),
                      questions: exam.questions.toString(),
                      completedAt: exam.completedAt,
                      points: exam.points,
                      score: exam.score,
                      examType: exam.examType,
                      attemptNumber: exam.attemptNumber,
                    }}
                    onViewResults={() => viewResults(exam.attemptId)}
                    onTakeExam={() => takeExam(exam.attemptId, exam.examId)}
                    canRetake={exam.canRetake}
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