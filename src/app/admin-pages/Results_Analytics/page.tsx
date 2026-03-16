"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  useMediaQuery,
  Avatar,
  useTheme,
} from "@mui/material";
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
import { Bar, Line } from "react-chartjs-2";
import { Visibility } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ChartContainer from "../../components/ChartContainer";
import StudentDetailModal from "@/app/components/AdminStudentDetailModal";

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

interface PerformanceData {
  subject: string;
  score: number;
  correct: string;
  color: "success" | "info" | "warning" | "error";
}

interface StudentResult {
  rank: number;
  username: string;
  studentId: number;

  // Individual exam fields
  score: number;
  timeSpent: string;
  correctAnswers: string;
  examDate: string;

  // All exam analytics
  overallPercentage: number;
  totalExamsAttempted: number;
}

const ResultsAnalytics = () => {
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const theme = useTheme();
  const [examType, setExamType] = useState("all");
  const [exam, setExam] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [currentPage, setCurrentPage] = useState(1);

  const [examLoading, setExamLoading] = useState(false);

  const [examList, setExamList] = useState<
    { exam_id: number; exam_title: string }[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalStudentName, setModalStudentName] = useState<string>("");
  const [modalRank, setModalRank] = useState<number | null>(null);
  const [examActivityData, setExamActivityData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [performanceTrend, setPerformanceTrend] = useState<any>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 80) return "info";
    if (score >= 70) return "warning";
    return "error";
  };

  const handleResetFilters = () => {
    setExamType("all");
    setExam("all");
    setDateRange("month");
    setCurrentPage(1);
  };

  const handleViewDetails = async (student: StudentResult) => {
    setModalStudentName(student.username);
    setModalRank(student.rank);
    setModalOpen(true);
    setModalLoading(true);

    try {
      const query = new URLSearchParams({
        studentId: String(student.studentId),
        examType,
        examId: exam,
      }).toString();

      const res = await fetch(`/api/analytics/student-details?${query}`);
      const data = await res.json();

      setModalData(data.studentResults || []);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const fetchExams = async () => {
      if (examType === "all") {
        setExamList([]);
        return;
      }

      try {
        setExamLoading(true);
        const res = await fetch(`/api/exams/list?examType=${examType}`);
        const data = await res.json();
        setExamList(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setExamLoading(false);
      }
    };

    fetchExams();
  }, [examType]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        let url = "";

        if (examType === "all" || exam === "all") {
          url = `/api/analytics/all-exams?${new URLSearchParams({
            examType,
            dateRange,
            page: String(currentPage),
          })}`;
        } else {
          url = `/api/analytics/${exam}?${new URLSearchParams({
            dateRange,
            page: String(currentPage),
          })}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.studentResults) setStudentResults(data.studentResults);
        if (data.totalPages) setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [examType, exam, dateRange, currentPage]);

  const fetchExamActivity = async () => {
    try {
      setChartLoading(true);

      const query = new URLSearchParams({
        examType,
        examId: exam,
        dateRange,
      }).toString();

      const res = await fetch(`/api/analytics/exam-activity?${query}`);
      const data = await res.json();

      const datasets: any[] = [];

      if (examType === "all") {
        datasets.push(
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
        );
      } else {
        const colorMap: any = {
          live: theme.palette.error.main,
          mock: theme.palette.secondary.main,
          practice: theme.palette.primary.main,
        };

        datasets.push({
          label: examType.charAt(0).toUpperCase() + examType.slice(1),
          data: data.datasets[examType],
          backgroundColor: colorMap[examType],
        });
      }

      setExamActivityData({
        labels: data.labels,
        ranges: data.ranges,
        datasets,
      });
    } catch (error) {
      console.error("Failed to fetch exam activity:", error);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchPerformanceTrend = async () => {
    try {
      setTrendLoading(true);

      const query = new URLSearchParams({
        examType,
        examId: exam,
        dateRange,
      }).toString();

      const res = await fetch(`/api/analytics/performance-trend?${query}`);
      const data = await res.json();

      setPerformanceTrend({
        labels: data.labels,
        weekRanges: data.weekRanges,
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

  useEffect(() => {
    fetchExamActivity();
  }, [examType, exam, dateRange]);

  useEffect(() => {
    fetchPerformanceTrend();
  }, [examType, exam, dateRange]);

  const getExamChartSubtitle = () => {
    if (dateRange === "week") return "Exam activity for the last 7 days";
    if (dateRange === "month") return "Exam activity for the last 30 days";
    if (dateRange === "quarter")
      return "Exam activity for the last 3 months (weekly range)";
    return "";
  };

  const getPerformChartSubtitle = () => {
    if (dateRange === "week") return "Average accuracy for last 7 days";
    if (dateRange === "month") return "Average accuracy for last 30 days";
    if (dateRange === "quarter")
      return "Average accuracy for last 3 months (weekly range)";
    return "";
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "grey.50" }}
    >
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && !isDesktop && (
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
          paddingTop: { xs: "50px", md: "80px" },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Results Analytics"
          sidebarOpen={sidebarOpen}
        />

        {/* Filters Section */}
        <Paper
          elevation={1}
          sx={{ padding: "20px", borderRadius: "10px", my: 4 }}
        >
          <Typography
            variant="h6"
            sx={{ marginBottom: "15px", color: "text.primary" }}
          >
            Filter Results
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Exam Type</InputLabel>
              <Select
                value={examType}
                label="Exam Type"
                onChange={(e) => {
                  setExamType(e.target.value);
                  setExam("all");
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="live">Live</MenuItem>
                <MenuItem value="mock">Mock</MenuItem>
                <MenuItem value="practice">Practice</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={examType === "all"}>
              <InputLabel>Exam</InputLabel>
              <Select
                value={exam}
                label="Exam"
                onChange={(e) => {
                  setExam(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="all">All Exams</MenuItem>

                {examLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={18} sx={{ mr: 1 }} />
                    Loading exams...
                  </MenuItem>
                )}
                {!examLoading && examList.length === 0 && (
                  <MenuItem disabled>No exams available</MenuItem>
                )}
                {!examLoading &&
                  examList.length > 0 &&
                  examList.map((examItem) => (
                    <MenuItem key={examItem.exam_id} value={examItem.exam_id}>
                      {examItem.exam_title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "15px",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </Box>
        </Paper>

        {/* Charts */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
            },
            gap: 2,
            marginBottom: "30px",
          }}
        >
          <ChartContainer
            title="Exam Activity Overview"
            minHeight={{ xs: 240, sm: 220, md: 280 }}
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
                <CircularProgress />
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
                }}
              >
                No exam activity available
              </Box>
            ) : (
              <Bar
                data={
                  examActivityData || {
                    datasets: [],
                    labels: [],
                  }
                }
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
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
                    legend: { display: true, position: "bottom" },
                    subtitle: {
                      display: true,
                      text: getExamChartSubtitle(),
                      font: { size: 11 },
                      padding: { bottom: 10 },
                      color: "#6b7280",
                    },
                    tooltip: {
                      callbacks: {
                        title: function (context: any) {
                          const index = context[0].dataIndex;

                          if (examActivityData?.ranges?.length) {
                            return examActivityData.ranges[index];
                          }

                          return context[0].label;
                        },
                        label: function (context: any) {
                          return `${context.dataset.label}: ${context.raw} exams taken`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </ChartContainer>

          <ChartContainer
            title="Performance Trend"
            minHeight={{ xs: 240, sm: 220, md: 280 }}
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
                <CircularProgress />
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
                options={{
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
                      position: "bottom",
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
                        title: function (context: any) {
                          const index = context[0].dataIndex;

                          if (performanceTrend?.weekRanges?.length) {
                            return performanceTrend.weekRanges[index];
                          }

                          return context[0].label;
                        },
                        label: function (context: any) {
                          return `Accuracy: ${context.raw}%`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </ChartContainer>
        </Box>

        {/* Results Table */}
        <Paper elevation={1} sx={{ borderRadius: "10px", overflow: "hidden" }}>
          <Box
            sx={{
              padding: "20px",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Detailed Results
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  {exam !== "all" && examType !== "all" ? (
                    <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                  ) : (
                    <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                  )}

                  <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>

                  {exam !== "all" && examType !== "all" ? (
                    <>
                      <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Correct</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Total Exams Attempted
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Overall %
                      </TableCell>
                    </>
                  )}

                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : studentResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  studentResults.map((student, index) => (
                    <TableRow
                      key={`${student.studentId}-${student.rank}`}
                      hover
                    >
                      <TableCell>
                        {student.rank ?? (currentPage - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell>{student.username}</TableCell>

                      {exam !== "all" && examType !== "all" ? (
                        <>
                          <TableCell>{student.score}</TableCell>
                          <TableCell>{student.correctAnswers}</TableCell>
                          <TableCell>{student.timeSpent}</TableCell>
                          <TableCell>
                            {student.examDate
                              ? new Date(student.examDate).toLocaleDateString(
                                  "en-GB",
                                )
                              : "-"}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{student.totalExamsAttempted}</TableCell>
                          <TableCell>
                            {`${student.overallPercentage} %`}
                          </TableCell>
                        </>
                      )}

                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(student)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{ display: "flex", justifyContent: "center", padding: "20px" }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </Paper>

        <StudentDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          studentName={modalStudentName}
          loading={modalLoading}
          details={modalData}
          examTypeFilter={examType}
          selectedExam={exam}
          rank={modalRank}
        />
      </Box>
    </Box>
  );
};

export default ResultsAnalytics;
