"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds} sec`;
};

const ScoreCircle = ({ score }: { score: number }) => {
  const percentage = score;
  const getScoreColor = (val: number): string => {
    if (val >= 60) return '#28a745';
    if (val >= 40) return '#ffc107';
    return '#dc3545';
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
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");

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

  const { attempt, exam, questions } = resultData;
  
  // Check if it's a live exam and if results should be hidden
  const isLiveExam = exam.exam_type === "live";
  const examEndTime = new Date(attempt.end_time);
  const resultsAvailableTime = new Date(examEndTime.getTime() + 30 * 60 * 1000); // 30 minutes after end time
  const isResultsAvailable = new Date() >= resultsAvailableTime;
  
  // Show message if live exam and results not available yet
  if (isLiveExam && !isResultsAvailable) {
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          sx={{
            padding: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              <AccessTimeIcon
                sx={{
                  fontSize: 50,
                  color: "white",
                }}
              />
            </Box>
          </Box>
          
          <Typography
            sx={{
              color: "#2c3e50",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              mb: 2,
            }}
          >
            Exam Completed Successfully! 🎉
          </Typography>
          
          <Typography
            sx={{
              color: "#6c757d",
              fontSize: { xs: "1rem", sm: "1.125rem" },
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            You have successfully completed the live exam. Your results will be available after 30 minutes. You can view them in the Exam History. Thank you.
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => router.push("/student-pages/exam_history")}
            sx={{
              textTransform: "none",
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              padding: { xs: "12px 32px", sm: "14px 40px" },
              fontSize: { xs: "1rem", sm: "1.125rem" },
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(106, 17, 203, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(106, 17, 203, 0.4)",
              },
            }}
          >
            Go to Exam History
          </Button>
        </Paper>
      </Box>
    );
  }
  
  const score = attempt.score || 0;
  const totalQuestions = exam.question_count || 0;
  const correctCount = attempt.correct_answers || 0;
  const wrongCount = attempt.wrong_answers || 0;
  const unansweredCount = attempt.unanswered || 0;
  const accuracy = attempt.accuracy || 0;
  const result = attempt.result || "Fail";
  const totalTimeTaken = attempt.total_time_seconds || 0;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const filteredQuestions = questions.filter(
    (q: any) => filter === "all" || q.status === filter
  );

  const handlePrint = () => {
    globalThis.window.print();
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
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 3 },
            color: "#2c3e50",
            textAlign: "center",
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
          }}
        >
          Result Summary 📊
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{xs:12, md:4}} sx={{ display: "flex", justifyContent: "center" }}>
            <ScoreCircle score={percentage} />
          </Grid>
          
          <Grid size={{xs:12, md:8}}>
            <Grid container spacing={2}>
              <Grid size={{xs:6, sm:3}}>
                <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <CardContent sx={{ textAlign: "center", padding: 2 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                      Score 🏆
                    </Typography>
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#28a745" }}>
                      {score}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{xs:6, sm:3}}>
                <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <CardContent sx={{ textAlign: "center", padding: 2 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                      Correct ✔️
                    </Typography>
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#28a745" }}>
                      {correctCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{xs:6, sm:3}}>
                <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <CardContent sx={{ textAlign: "center", padding: 2 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                      Wrong ❌
                    </Typography>
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc3545" }}>
                      {wrongCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{xs:6, sm:3}}>
                <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <CardContent sx={{ textAlign: "center", padding: 2 }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                      Unanswered ⏭️
                    </Typography>
                    <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffc107" }}>
                      {unansweredCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                  Accuracy 🎯
                </Typography>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50" }}>
                  {accuracy}%
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                  Result 📜
                </Typography>
                <Chip
                  label={result === "pass" ? "Pass" : "Fail"}
                  color={result === "pass" ? "success" : "error"}
                  size="medium"
                  sx={{ fontSize: "1rem", padding: "0 16px" }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Typography sx={{ fontSize: "0.875rem", color: "#6c757d", mb: 0.5 }}>
                  Total Time Taken ⏱️
                </Typography>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50" }}>
                  {Math.floor(totalTimeTaken / 60)}m {totalTimeTaken % 60}s
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography
          sx={{
            color: "#6c757d",
            textAlign: "center",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Completed on {new Date(attempt.end_time).toLocaleDateString()} •
          Time Spent: {Math.floor(totalTimeTaken / 60)} minutes {totalTimeTaken % 60} seconds
          {exam.time_limit_minutes > 0 && (
            <Box component="span" sx={{ ml: 1 }}>
              out of {exam.time_limit_minutes} minutes
            </Box>
          )}
        </Typography>
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
            Question Review ({filteredQuestions.length} of {questions.length})
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
              <Button
                variant={filter === "unanswered" ? "contained" : "outlined"}
                onClick={() => setFilter("unanswered")}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: 11, sm: 12 },
                  flex: 1,
                }}
              >
                Unanswered
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

            </Box>
          </Box>
        </Box>

        {filteredQuestions.map((question: any, index: number) => (
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
                Question {question.questionOrder}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: "#6a11cb" }} />
                  <Typography sx={{ fontSize: "0.875rem", color: "#6c757d" }}>
                    {formatTime(question.timeTaken)}
                  </Typography>
                </Box>
                <Chip
                  label={
                    question.status === "correct" ? "Correct" : 
                    question.status === "incorrect" ? "Incorrect" : "Unanswered"
                  }
                  color={
                    question.status === "correct" ? "success" : 
                    question.status === "incorrect" ? "error" : "warning"
                  }
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
                {question.options.map((option: any, optIndex: number) => (
                  <ListItem
                    key={`option-${question.id}-${optIndex}`}
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
                      {String.fromCodePoint(65 + optIndex)}
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
                  mt: 2,
                  padding: 1.5,
                  borderRadius: 1,
                  borderLeft: "4px solid #2575fc",
                  backgroundColor: "#e3f2fd",
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 0.5, color: "#2575fc" }}>
                  Explanation:
                </Typography>
                <Typography sx={{ color: "#1976d2", fontWeight: 500 }}>
                  {question.explanation || "Explanation not available"}
                </Typography>
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
            variant="contained"
            onClick={() => router.push("/student-pages/exam_history")}
            sx={{
              textTransform: "none",
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Back to Exam History
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
