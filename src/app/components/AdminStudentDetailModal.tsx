"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Pagination,
  TableCell,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Divider,
  IconButton,
  TableContainer,
  Chip,
  Paper,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PlayArrow, Assessment, LiveTv } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";

interface StudentDetailModalProps {
  open: boolean;
  onClose: () => void;
  studentName?: string;
  rank: number | null;
  loading?: boolean;
  details?: Record<string, any>[];
  examTypeFilter: string; // all, live, mock, practice
  selectedExam?: string; // specific exam
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  open,
  onClose,
  studentName,
  loading,
  details = [],
  examTypeFilter,
  selectedExam,
  rank,
}) => {
  const examTypeConfig: Record<
    string,
    { color: "primary" | "secondary" | "error"; icon: JSX.Element }
  > = {
    practice: { color: "primary", icon: <PlayArrow fontSize="small" /> },
    mock: { color: "secondary", icon: <Assessment fontSize="small" /> },
    live: { color: "error", icon: <LiveTv fontSize="small" /> },
  };

  const [questions, setQuestions] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [questionLoading, setQuestionLoading] = useState(false);

  const filteredQuestions = questions
    .filter((q) => {
      // Status filter
      if (filter !== "all" && q.status !== filter) return false;

      // Time filter
      if (timeFilter === "less30" && q.timeTaken >= 30) return false;

      if (timeFilter === "30to60" && (q.timeTaken < 30 || q.timeTaken > 60))
        return false;

      if (timeFilter === "1to2" && (q.timeTaken < 60 || q.timeTaken > 120))
        return false;

      if (timeFilter === "more2" && q.timeTaken <= 120) return false;

      return true;
    })
    .sort((a: any, b: any) => b.timeTaken - a.timeTaken);

  const formatTime = (seconds: number) => {
    if (!seconds) return "0 sec";

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    if (min === 0) return `${sec} sec`;
    return `${min} min ${sec} sec`;
  };

  const handlePrint = () => {
    window.print();
  };

  const [tabIndex, setTabIndex] = useState(0);
  const isIndividualExam = !!selectedExam && selectedExam !== "all";

  // Define tabs based on filters
  const tabs =
    examTypeFilter === "all" && selectedExam === "all"
      ? ["live", "mock", "practice"]
      : [examTypeFilter];

  // Filter results for each tab
  const getTabData = (tab: string) =>
    details.filter((item) => item.examType?.toLowerCase() === tab);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const tabData = getTabData(tabs[tabIndex]);
  const paginatedData = tabData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  useEffect(() => {
    if (open) {
      setTabIndex(0);
      setPage(1);

      setFilter("all");
      setTimeFilter("all");
      setQuestions([]);
    }
  }, [open, studentName]);

  useEffect(() => {
    const fetchQuestionReview = async () => {
      if (!open || !details.length) return;

      try {
        setQuestionLoading(true);
        setQuestions([]);

        // ✅ get first attempt (since individual exam)
        const attemptId = details[0]?.attemptId;

        if (!attemptId) return;

        const res = await fetch(
          `/api/analytics/question-review?attemptId=${attemptId}`,
        );

        const data = await res.json();
        setQuestions(data || []);
      } catch (error) {
        console.error("Failed to fetch question review:", error);
        setQuestions([]);
      } finally {
        setQuestionLoading(false);
      }
    };

    fetchQuestionReview();
  }, [open, details]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing when clicking outside or pressing Escape
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      fullScreen={isIndividualExam}
      maxWidth={isIndividualExam ? false : "lg"}
      scroll="paper"
      fullWidth={!isIndividualExam}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        {studentName
          ? `${studentName}'s Detailed Analytics`
          : "Student Details"}

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 5,
            }}
          >
            <Typography>No data available</Typography>
          </Box>
        ) : (
          <>
            {/* Tabs */}
            {!isIndividualExam && (
              <Tabs
                value={tabIndex}
                onChange={(_, newValue) => {
                  setTabIndex(newValue);
                  setPage(1);
                }}
                sx={{
                  marginBottom: 2,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    borderRadius: tabs.length > 1 ? "16px 16px 0 0" : "0px",
                    marginRight: 1,
                    minWidth: 100,
                    backgroundColor: "rgba(0,0,0,0.05)",
                  },
                  "& .Mui-selected": {
                    fontWeight: "bold",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    border: tabs.length > 1 ? 0 : "2px solid #1976d2",
                  },
                }}
              >
                {tabs.map((tab) => {
                  const config = examTypeConfig[tab.toLowerCase()] || {
                    color: "default" as any,
                    icon: null,
                  };
                  const count = getTabData(tab).length;

                  return (
                    <Tab
                      key={tab}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {config.icon}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          <Chip
                            label={count}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: (theme) =>
                                theme.palette[config.color].main,
                              color: "#fff",
                              height: 20,
                              fontSize: 12,
                            }}
                          />
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            )}

            {/* Table for selected tab */}
            <>
              {isIndividualExam ? (
                // ✅ CARD VIEW (Individual Exam)
                getTabData(tabs[tabIndex]).map((exam: any, idx: number) => (
                  <Box key={idx}>
                    <Paper
                      elevation={1}
                      sx={{ borderRadius: "10px", overflow: "hidden" }}
                    >
                      <Box
                        sx={{
                          padding: "20px",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "text.primary" }}>
                          <Box component="span" sx={{ fontWeight: "bold" }}>
                            Exam Title:
                          </Box>{" "}
                          {exam.examTitle}{" "}
                          {isIndividualExam && exam.examType && (
                            <>
                              <Chip
                                label={
                                  exam.examType.charAt(0).toUpperCase() +
                                  exam.examType.slice(1)
                                }
                                color={
                                  examTypeConfig[exam.examType.toLowerCase()]
                                    ?.color || "default"
                                }
                                size="small"
                              />
                            </>
                          )}
                        </Typography>
                      </Box>

                      <Divider />
                      <Box sx={{ padding: "20px" }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{ color: "text.primary" }}
                          >
                            Default
                          </Typography>
                        </Box>
                        <Table
                          sx={{
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "grey.50" }}>
                              <TableCell></TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Rank #
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Exam
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Score
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Accuracy
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Correct
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Incorrect
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Unanswered
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Attempts
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Result
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getTabData(tabs[tabIndex]).map((exam: any) => (
                              <TableRow key={exam.examId} hover>
                                <TableCell
                                  sx={{
                                    backgroundColor: "grey.50",
                                    fontWeight: "bold",
                                  }}
                                >
                                  You
                                </TableCell>
                                <TableCell>
                                  {exam.result?.toLowerCase() === "pass"
                                    ? (rank ?? "-")
                                    : "-"}
                                </TableCell>
                                <TableCell>{exam.examTitle}</TableCell>
                                <TableCell>{exam.score ?? "-"}</TableCell>
                                <TableCell>
                                  {exam.accuracy !== undefined &&
                                  exam.accuracy !== null
                                    ? `${exam.accuracy}%`
                                    : "-"}
                                </TableCell>
                                <TableCell>{exam.correct ?? "-"}</TableCell>
                                <TableCell>{exam.incorrect ?? "-"}</TableCell>
                                <TableCell>{exam.unanswered ?? "-"}</TableCell>
                                <TableCell>{exam.attempts ?? "-"}</TableCell>
                                <TableCell>{exam.timeSpent ?? "-"}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      exam.result
                                        ? exam.result.charAt(0).toUpperCase() +
                                          exam.result.slice(1)
                                        : "Fail"
                                    }
                                    color={
                                      exam.result?.toLowerCase() === "pass"
                                        ? "success"
                                        : "error"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}

                            {getTabData(tabs[tabIndex]).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={9} align="center">
                                  No results for this tab
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>

                      {/* TOPIC WISE SUMMARY */}
                      {exam.topicSummary?.length > 0 && (
                        <Box sx={{ padding: "20px" }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{ color: "text.primary" }}
                            >
                              Topic Wise Analysis
                            </Typography>
                          </Box>

                          <TableContainer>
                            <Table
                              sx={{
                                borderTop: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <TableHead>
                                <TableRow sx={{ backgroundColor: "grey.50" }}>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Subject
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Topic
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Total
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Correct
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Wrong
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Unanswered
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {exam.topicSummary.map(
                                  (row: any, index: number) => (
                                    <TableRow key={index} hover>
                                      <TableCell>{row.subject}</TableCell>
                                      <TableCell>{row.topic}</TableCell>
                                      <TableCell>{row.total}</TableCell>
                                      <TableCell>{row.correct}</TableCell>
                                      <TableCell>{row.wrong}</TableCell>
                                      <TableCell>{row.unanswered}</TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      <Paper
                        sx={{
                          padding: { xs: 2, sm: 2.5, md: 3 },
                          borderRadius: 2,
                          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
                          mt: 3,
                        }}
                      >
                        {/* HEADER */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Typography>
                            Question Review ({filteredQuestions.length} of{" "}
                            {questions.length})
                          </Typography>

                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            {/* FILTER BUTTONS */}
                            <ButtonGroup size="small">
                              {[
                                "all",
                                "correct",
                                "incorrect",
                                "unanswered",
                              ].map((val) => (
                                <Button
                                  key={val}
                                  variant={
                                    filter === val ? "contained" : "outlined"
                                  }
                                  onClick={() => setFilter(val)}
                                >
                                  {val}
                                </Button>
                              ))}
                            </ButtonGroup>

                            {/* TIME FILTER */}
                            <FormControl size="small">
                              <InputLabel>Time-Based</InputLabel>
                              <Select
                                value={timeFilter}
                                label="Time-Based"
                                onChange={(e) => setTimeFilter(e.target.value)}
                              >
                                <MenuItem value="all">All Time</MenuItem>
                                <MenuItem value="less30">
                                  Less than 30 sec
                                </MenuItem>
                                <MenuItem value="30to60">30-60 sec</MenuItem>
                                <MenuItem value="1to2">1-2 min</MenuItem>
                                <MenuItem value="more2">
                                  More than 2 min
                                </MenuItem>
                              </Select>
                            </FormControl>

                            {/* PRINT */}
                            <Button
                              variant="outlined"
                              startIcon={<PrintIcon />}
                              onClick={handlePrint}
                              color="warning"
                            >
                              Print
                            </Button>
                          </Box>
                        </Box>

                        {/* QUESTIONS */}
                        {questionLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              py: 3,
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        ) : filteredQuestions.length === 0 ? (
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 4,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body1" color="text.secondary">
                              No questions found for selected filter
                            </Typography>
                          </Box>
                        ) : (
                          filteredQuestions.map((question: any) => (
                            <Card key={question.id} sx={{ mb: 2 }}>
                              {/* HEADER */}
                              <Box
                                sx={{
                                  p: 2,
                                  background: "#f5f5f5",
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography>
                                  Question {question.questionOrder}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 0.5,
                                      alignItems: "center",
                                    }}
                                  >
                                    <AccessTimeIcon sx={{ fontSize: 16 }} />{" "}
                                    <Typography>
                                      {formatTime(question.timeTaken)}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      question.status &&
                                      question.status.charAt(0).toUpperCase() +
                                        question.status.slice(1)
                                    }
                                    color={
                                      question.status === "correct"
                                        ? "success"
                                        : question.status === "incorrect"
                                          ? "error"
                                          : "warning"
                                    }
                                    size="small"
                                  />
                                </Box>
                              </Box>

                              {/* BODY */}
                              <CardContent>
                                <Typography
                                  sx={{
                                    mb: 2,
                                    whiteSpace: "pre-wrap",
                                    fontWeight: 600,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {question.text}
                                </Typography>

                                <List>
                                  {question.options.map(
                                    (opt: any, i: number) => (
                                      <ListItem
                                        key={i}
                                        sx={{
                                          mb: 1,
                                          border: "1px solid #ddd",
                                          borderRadius: 1,
                                          backgroundColor: opt.correct
                                            ? "#d4edda"
                                            : opt.selected && !opt.correct
                                              ? "#f8d7da"
                                              : "transparent",
                                        }}
                                      >
                                        <ListItemText
                                          primary={
                                            <Typography
                                              sx={{ whiteSpace: "pre-wrap" }}
                                            >
                                              {opt.text}
                                            </Typography>
                                          }
                                        />

                                        {opt.correct && (
                                          <CheckCircleIcon color="success" />
                                        )}
                                        {opt.selected && !opt.correct && (
                                          <CancelIcon color="error" />
                                        )}
                                      </ListItem>
                                    ),
                                  )}
                                </List>

                                {/* EXPLANATION */}
                                <Box
                                  sx={{ mt: 2, p: 2, background: "#e3f2fd" }}
                                >
                                  <Typography fontWeight={600}>
                                    Explanation:
                                  </Typography>
                                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                    {question.explanation || "Not available"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </Paper>
                    </Paper>
                  </Box>
                ))
              ) : (
                <>
                  <TableContainer>
                    <Table
                      sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "grey.50" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            S.No
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Exam
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Score
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Accuracy
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Correct
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Incorrect
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Unanswered
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Attempts
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Time
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Result
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((exam: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell>
                              {(page - 1) * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell>{exam.examTitle}</TableCell>
                            <TableCell>{exam.score ?? "-"}</TableCell>
                            <TableCell>
                              {exam.accuracy !== undefined &&
                              exam.accuracy !== null
                                ? `${exam.accuracy}%`
                                : "-"}
                            </TableCell>
                            <TableCell>{exam.correct ?? "-"}</TableCell>
                            <TableCell>{exam.incorrect ?? "-"}</TableCell>
                            <TableCell>{exam.unanswered ?? "-"}</TableCell>
                            <TableCell>{exam.attempts ?? "-"}</TableCell>
                            <TableCell>{exam.timeSpent ?? "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  exam.result
                                    ? exam.result.charAt(0).toUpperCase() +
                                      exam.result.slice(1)
                                    : "Fail"
                                }
                                color={
                                  exam.result?.toLowerCase() === "pass"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}

                        {tabData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} align="center">
                              No results for this tab
                            </TableCell>
                          </TableRow>
                        )}
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
                      count={Math.ceil(tabData.length / rowsPerPage)}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailModal;
