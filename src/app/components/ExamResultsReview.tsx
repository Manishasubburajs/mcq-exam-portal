"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, active: false },
  { label: "Take Exam", icon: <AssignmentIcon />, active: false },
  { label: "Results", icon: <BarChartIcon />, active: true },
  { label: "Exam History", icon: <HistoryIcon />, active: false },
  { label: "Profile", icon: <PersonIcon />, active: false },
  { label: "Settings", icon: <SettingsIcon />, active: false },
  { label: "Logout", icon: <LogoutIcon />, active: false },
];

const categories: any[] = [];

// Questions will be set from fetched data

const ScoreCircle = ({ score }: { score: number }) => {
  const percentage = score;
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "#28a745";
    if (score >= 70) return "#ffc107";
    return "#dc3545";
  };
  const color = getScoreColor(percentage);

  return (
    <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={150}
        thickness={8}
        sx={{
          color: color,
          backgroundColor: "transparent",
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 8px #e9ecef",
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
};

export default function ExamResultsReview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get("attemptId");

  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/students/result?attemptId=${attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setResultData(data.data);
        } else {
          setError(data.message || "Failed to load results");
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !resultData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>{error || "Results not found"}</Typography>
      </Box>
    );
  }

  // Transform data
  const exam = resultData.exam;
  const answers = resultData.student_answers;

  const questions = answers.map((answer: any, index: number) => {
    const q = answer.question;
    const options = [
      { id: "A", text: q.option_a },
      { id: "B", text: q.option_b },
      { id: "C", text: q.option_c },
      { id: "D", text: q.option_d },
    ].filter((opt) => opt.text); // Filter out null options
    const correctAnswer = q.correct_answer;
    const selectedAnswer = answer.selected_answer;

    return {
      id: q.question_id,
      title: `Question ${index + 1}`,
      text: q.question_text,
      status: selectedAnswer === correctAnswer ? "correct" : "incorrect",
      timeTaken: answer.time_taken_seconds || 0,
      options: options.map((opt: any) => ({
        text: opt.text,
        correct: opt.id === correctAnswer,
        selected: opt.id === selectedAnswer,
      })),
      explanation: "Explanation not available", // Placeholder
    };
  });

  const score = resultData.score || 0;
  const totalQuestions = exam.question_count || 0;
  const correctCount = resultData.correct_answers || 0;
  const wrongCount = resultData.wrong_answers || 0;
  const unansweredCount = totalQuestions - correctCount - wrongCount;

  const filteredQuestions = questions.filter(
    (q: any) => filter === "all" || q.status === filter
  );

  const handlePrint = () => {
    globalThis.window.print();
  };

  const handleExport = () => {
    alert("Exporting results as PDF...");
  };

  return (
    <Box
      sx={{
        flex: 1,
        padding: {
          xs: "60px 8px 16px",
          sm: "70px 16px 24px",
          md: "16px 24px 32px",
          lg: "24px 32px 40px",
        },
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
          paddingBottom: { xs: 1, sm: 1.5 },
          borderBottom: "1px solid #e0e0e0",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2, md: 0 },
        }}
      >
        <Typography
          sx={{
            color: "#2c3e50",
            fontWeight: 600,
            textAlign: { xs: "center", sm: "left" },
            fontSize: {
              xs: "1.1rem",
              sm: "1.25rem",
              md: "1.5rem",
              lg: "2.125rem",
            },
            lineHeight: 1.2,
          }}
        >
          Exam Results: {exam.exam_title}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/student-pages/exam_history")}
          sx={{
            textTransform: "none",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            width: { xs: "100%", sm: "auto" },
            mb: { xs: 0.5, sm: 0 },
          }}
        >
          Back to Exam History
        </Button>
      </Box>

      {/* Results Summary */}
      <Paper
        sx={{
          padding: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <ScoreCircle score={Math.round((score / (totalQuestions * 2)) * 100)} />
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 0.75, sm: 1 },
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
          }}
        >
          {exam.exam_title}
        </Typography>
        <Typography
          sx={{
            color: "#6c757d",
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
          }}
        >
          Completed on {new Date(resultData.end_time).toLocaleDateString()} •
          Time Spent: {Math.floor(resultData.total_time_seconds / 60)} minutes{" "}
          {resultData.total_time_seconds % 60} seconds out of{" "}
          {exam.time_limit_minutes} minutes
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 0.75, sm: 1, md: 2 },
            maxWidth: { xs: "100%", sm: 600 },
            mx: "auto",
            justifyContent: "center",
            "& > *": {
              flex: { xs: "1 1 45%", sm: "1 1 22%" },
              minWidth: { xs: "100px", sm: "120px", md: "140px" },
            },
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: "#f8f9fa",
              borderRadius: 1,
              minHeight: { xs: 80, sm: "auto" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
              }}
            >
              {correctCount}/{totalQuestions}
            </Typography>
            <Typography
              sx={{
                color: "#6c757d",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2,
              }}
            >
              Questions Correct
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: "#f8f9fa",
              borderRadius: 1,
              minHeight: { xs: 80, sm: "auto" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                color:
                  Math.round((score / (totalQuestions * 2)) * 100) >= 50
                    ? "green"
                    : "red",
              }}
            >
              {Math.round((score / (totalQuestions * 2)) * 100) >= 50
                ? "Pass"
                : "Fail"}
            </Typography>
            <Typography
              sx={{
                color: "#6c757d",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2,
              }}
            >
              Result
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: "#f8f9fa",
              borderRadius: 1,
              minHeight: { xs: 80, sm: "auto" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              Correct: {correctCount}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              Wrong: {wrongCount}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              Unanswered: {unansweredCount}
            </Typography>
            <Typography
              sx={{
                color: "#6c757d",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2,
              }}
            >
              Question Counts
            </Typography>
          </Box>
          {/* <Box sx={{
              textAlign: 'center',
              padding: { xs: 1, sm: 1.5 },
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              minHeight: { xs: 80, sm: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginLeft: 'auto'
            }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                {Math.round((score / (totalQuestions * 2)) * 100)}%
              </Typography>
              <Typography sx={{
                color: '#6c757d',
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.2
              }}>
                Overall Score
              </Typography>
            </Box> */}
        </Box>
      </Paper>

      {/* Performance Breakdown */}
      <Paper
        sx={{
          padding: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            color: "#2c3e50",
            paddingBottom: { xs: 0.75, sm: 1 },
            borderBottom: "2px solid #f0f0f0",
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
          }}
        >
          Performance by Category
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.5, sm: 2 },
            "& > *": {
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(33.333% - 16px)",
              },
              minWidth: { xs: "200px", sm: "250px", md: "200px" },
            },
          }}
        >
          {categories.map((category) => (
            <Box
              key={category.name}
              sx={{ padding: 1.5, borderRadius: 1, backgroundColor: "#f8f9fa" }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {category.score}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={category.score}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: "#e9ecef",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: (() => {
                      if (category.score >= 90) return "#28a745";
                      if (category.score >= 70) return "#20c997";
                      return "#ffc107";
                    })(),
                    borderRadius: 1,
                  },
                }}
              />
              <Typography sx={{ fontSize: 12, color: "#6c757d" }}>
                {category.correct}/{category.total} questions correct
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Questions Review */}
      <Paper
        sx={{
          padding: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 1.5, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2, md: 0 },
          }}
        >
          <Typography
            sx={{
              color: "#2c3e50",
              paddingBottom: { xs: 0.75, sm: 1 },
              borderBottom: "2px solid #f0f0f0",
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            Question Review
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 0.75, sm: 1 },
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <ButtonGroup
              variant="outlined"
              size="small"
              sx={{
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant={filter === "all" ? "contained" : "outlined"}
                onClick={() => setFilter("all")}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  flex: 1,
                }}
              >
                All
              </Button>
              <Button
                variant={filter === "correct" ? "contained" : "outlined"}
                onClick={() => setFilter("correct")}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  flex: 1,
                }}
              >
                Correct
              </Button>
              <Button
                variant={filter === "incorrect" ? "contained" : "outlined"}
                onClick={() => setFilter("incorrect")}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  flex: 1,
                }}
              >
                Incorrect
              </Button>
            </ButtonGroup>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: { xs: 0, sm: 0 },
                justifyContent: { xs: "center", sm: "flex-start" },
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  minWidth: { xs: "auto", sm: 120 },
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "inline" } }}>Print</Box>
                <Box sx={{ display: { xs: "inline", sm: "none" } }}>
                  <PrintIcon />
                </Box>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  minWidth: { xs: "auto", sm: 120 },
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "inline" } }}>Export</Box>
                <Box sx={{ display: { xs: "inline", sm: "none" } }}>
                  <DownloadIcon />
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>

        {filteredQuestions.map((question: any) => (
          <Card
            key={question.id}
            sx={{
              mb: 2,
              borderRadius: 1,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box
              sx={{
                padding: { xs: 1, sm: 1.5 },
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {question.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#6a11cb" }} />
                  <Typography sx={{ fontSize: "0.875rem", color: "#6c757d" }}>
                    {question.timeTaken}s
                  </Typography>
                </Box>
                <Chip
                  label={
                    question.status === "correct" ? "Correct" : "Incorrect"
                  }
                  color={question.status === "correct" ? "success" : "error"}
                  size="small"
                />
              </Box>
            </Box>
            <CardContent sx={{ padding: { xs: 1.5, sm: 2 } }}>
              <Typography
                sx={{
                  mb: 2,
                  lineHeight: 1.5,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {question.text}
              </Typography>
              <List>
                {question.options.map((option: any, index: number) => (
                  <ListItem
                    key={`option-${question.id}-${index}`}
                    sx={{
                      padding: "12px 15px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: (() => {
                        if (option.correct) return "#d4edda";
                        if (option.selected && !option.correct)
                          return "#f8d7da";
                        if (option.selected) return "#fff3cd";
                        return "transparent";
                      })(),
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {String.fromCodePoint(65 + index)}
                    </Box>
                    <ListItemText primary={option.text} />
                    {option.correct && (
                      <CheckCircleIcon sx={{ color: "#28a745", ml: 1 }} />
                    )}
                    {option.selected && !option.correct && (
                      <CancelIcon sx={{ color: "#dc3545", ml: 1 }} />
                    )}
                    {option.selected && option.correct && (
                      <CheckCircleIcon sx={{ color: "#28a745", ml: 1 }} />
                    )}
                  </ListItem>
                ))}
              </List>
              <Box
                sx={{
                  backgroundColor: "#e7f3ff",
                  padding: 1.5,
                  borderRadius: 1,
                  mt: 1.5,
                  borderLeft: "4px solid #2575fc",
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#2575fc" }}>
                  Explanation:
                </Typography>
                <Typography>{question.explanation}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Navigation */}
        <Box
          sx={{
            textAlign: "center",
            mt: 3,
            display: "flex",
            justifyContent: "center",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ChevronLeftIcon />}
            sx={{
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              mb: { xs: 0.5, sm: 0 },
            }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push("/student-pages/exam_history")}
            sx={{
              textTransform: "none",
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              width: { xs: "100%", sm: "auto" },
              mb: { xs: 0.5, sm: 0 },
            }}
          >
            Back to Exam History
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<ChevronRightIcon />}
            sx={{
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
