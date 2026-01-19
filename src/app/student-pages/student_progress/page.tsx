"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  CircularProgress,
  Pagination,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  CheckCircle,
  School,
  Cancel,
  PlayArrow,
  Assessment,
  LiveTv,
  Timer,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2"; // cSpell:ignore chartjs
import { useRouter } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StudentProgressPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [subjectPerformance, setSubjectPerformance] = useState<
    { subject: string; percentage: number }[]
  >([]);

  const [stats, setStats] = useState({
    averageScore: 0,
    examsTaken: 0,
    passed: 0,
    failed: 0,
  });

  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
    ],
    datasets: [
      {
        label: "Average Score",
        data: [72, 75, 74, 78, 76, 80, 79, 81, 82, 84],
        borderColor: "#6a11cb",
        backgroundColor: "rgba(106, 17, 203, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return "Score: " + context.parsed.y + "%";
          },
        },
      },
    },
  };

  const getScoreColor = (score: number) => {
    const PASS_PERCENTAGE = 33;
    return score >= PASS_PERCENTAGE ? "#28a745" : "#dc3545";
  };

  const getProgressColor = (percentage: number) => {
    const PASS_PERCENTAGE = 33;
    return percentage >= PASS_PERCENTAGE ? "#28a745" : "#dc3545";
  };

  const SUBJECTS = [
    "Environment",
    "Geography",
    "Science & Technology",
    "Polity",
    "Economics",
    "History",
    "Current Affairs",
  ];

  const SUBJECT_ALIAS_MAP: Record<string, string> = {
    "Modern History": "History",
    History: "History",

    "Science & Technology": "Science & Technology",
    "Current Affairs": "Current Affairs",
    Polity: "Polity",
    Economics: "Economics",
    Geography: "Geography",
    Environment: "Environment",
  };

  const normalizeSubject = (subject: string) => {
    return SUBJECT_ALIAS_MAP[subject] ?? subject;
  };

  const MARKS_PER_QUESTION = 2;

  const calculateSubjectPerformance = (attempts: any[]) => {
    const practiceExams = attempts.filter(
      (exam) => exam.examType === "practice"
    );

    const subjectMap: Record<string, { obtained: number; total: number }> = {};

    practiceExams.forEach((exam) => {
      const subject = normalizeSubject(exam.subject);
      const obtainedMarks = Number(exam.score);
      const totalMarks = exam.questions * MARKS_PER_QUESTION;

      if (!subjectMap[subject]) {
        subjectMap[subject] = { obtained: 0, total: 0 };
      }

      subjectMap[subject].obtained += obtainedMarks;
      subjectMap[subject].total += totalMarks;
    });

    // Return all subjects (even if no practice exam)
    return SUBJECTS.map((subject) => {
      const data = subjectMap[subject];

      const percentage =
        data && data.total > 0
          ? Number(((data.obtained / data.total) * 100).toFixed(2))
          : 0;

      return {
        subject,
        percentage,
      };
    });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} min`;
  };

  const formatTimeTaken = (takenSeconds: number, totalMinutes: number) => {
    const totalSeconds = totalMinutes * 60;
    return `${formatTime(takenSeconds)} / ${formatTime(totalSeconds)}`;
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "practice":
        return "primary";
      case "mock":
        return "secondary";
      case "live":
        return "error";
      default:
        return "default";
    }
  };

  const calculatePercentageFromScore = (
    score: number,
    totalQuestions: number
  ) => {
    if (!totalQuestions || totalQuestions === 0) return 0;

    const totalMarks = totalQuestions * MARKS_PER_QUESTION;
    return Number(((score / totalMarks) * 100).toFixed(2));
  };

  useEffect(() => {
    if (attempts.length > 0) {
      const result = calculateSubjectPerformance(attempts);
      setSubjectPerformance(result);
    }
  }, [attempts]);

  useEffect(() => {
    if (attempts.length > 0) {
      const totalExams = attempts.length;

      // Average Score in %
      const sumPercentage = attempts.reduce((sum, exam) => {
        const percentage = calculatePercentageFromScore(
          Number(exam.score),
          exam.questions
        );
        return sum + percentage;
      }, 0);
      const avgScore =
        totalExams > 0 ? Number((sumPercentage / totalExams).toFixed(2)) : 0;

      // Passed / Failed exams (based on 33% pass rule)
      const passedExams = attempts.filter((exam) => {
        const percentage = calculatePercentageFromScore(
          Number(exam.score),
          exam.questions
        );
        return percentage >= 33;
      }).length;
      const failedExams = totalExams - passedExams;

      setStats({
        averageScore: avgScore,
        examsTaken: totalExams,
        passed: passedExams,
        failed: failedExams,
      });
    }
  }, [attempts]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch("/api/students/attempts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json.success) {
          setAttempts(json.data);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const paginatedAttempts = attempts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(attempts.length / rowsPerPage);

  const handleReview = (attemptId: number) => {
    router.push(`/student-pages/exam_res_rev?attemptId=${attemptId}`);
  };

  return (
    <Box
      component="main"
      sx={{
        p: {
          xs: 1.5,
          sm: 2.5,
          md: 3.75,
        },
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        transition: "all 0.3s ease",
      }}
    >
      {/* Stats Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1.5, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3, md: 4 },
          "& > *": {
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(25% - 18px)",
            },
            minWidth: { xs: "150px", sm: "180px", md: "150px" },
          },
        }}
      >
        {[
          {
            icon: <TrendingUp />,
            value: `${stats.averageScore}%`,
            label: "Average Score",
            color: "#1a73e8",
          },
          {
            icon: <School />,
            value: `${stats.examsTaken}`,
            label: "Exams Taken",
            color: "#28a745",
          },
          {
            icon: <CheckCircle />,
            value: `${stats.passed}`,
            label: "Passed Exams",
            color: "#20c997",
          },
          {
            icon: <Cancel />,
            value: `${stats.failed}`,
            label: "Failed Exams",
            color: "#dc3545",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              borderRadius: 2,
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s ease",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: `${stat.color}20`,
                    color: stat.color,
                    width: 60,
                    height: 60,
                    mr: 2,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: "#7f8c8d", fontSize: "14px" }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Performance Chart */}
      <Card
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            Performance Trend
          </Typography>
          <Box sx={{ height: { xs: 250, sm: 280, md: 300 } }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              mb: 0.5,
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            Subject Performance
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#7f8c8d",
              mb: { xs: 2, sm: 3 },
            }}
          >
            Based on practice exams only
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 2.5, md: 3 },
                "& > *": {
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 10px)",
                    md: "1 1 calc(33.333% - 20px)",
                  },
                  minWidth: { xs: "150px", sm: "200px", md: "150px" },
                },
              }}
            >
              {subjectPerformance.map((item) => (
                <Box
                  key={item.subject}
                  sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.subject}
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.percentage}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e9ecef",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getProgressColor(item.percentage),
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Exam History */}
      <Card
        sx={{
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 2, sm: 3 },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#2c3e50",
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Recent Exam History
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Score (%)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Time Taken
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAttempts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          No exam history found
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedAttempts.map((exam) => (
                      <TableRow hover key={exam.attemptId}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {exam.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              exam.examType.charAt(0).toUpperCase() +
                              exam.examType.slice(1)
                            }
                            color={getExamTypeColor(exam.examType)}
                            size="small"
                            icon={
                              exam.examType === "practice" ? (
                                <PlayArrow />
                              ) : exam.examType === "mock" ? (
                                <Assessment />
                              ) : (
                                <LiveTv />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{formatDate(exam.completedAt)}</TableCell>
                        <TableCell>
                          {(() => {
                            const percentage = calculatePercentageFromScore(
                              Number(exam.score),
                              exam.questions
                            );

                            return (
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: getScoreColor(percentage),
                                }}
                              >
                                {percentage}%
                              </Typography>
                            );
                          })()}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Timer sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {formatTimeTaken(
                                exam.totalTimeSeconds,
                                exam.duration
                              )}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: "#d4edda",
                              color: "#155724",
                              px: 1,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: "12px",
                              fontWeight: 600,
                              display: "inline-block",
                            }}
                          >
                            Completed
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => handleReview(exam.attemptId)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <Pagination
                  color="primary"
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProgressPage;
