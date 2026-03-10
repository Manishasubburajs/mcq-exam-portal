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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PlayArrow, Assessment, LiveTv } from "@mui/icons-material";

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

  const [tabIndex, setTabIndex] = useState(0);
  const isIndividualExam = selectedExam && selectedExam !== "all";

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
    }
  }, [open, studentName]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing when clicking outside or pressing Escape
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      maxWidth="lg"
      fullWidth
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
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
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
                                Attempts
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
                                Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Accuracy
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
                                <TableCell>{rank ?? "-"}</TableCell>
                                <TableCell>{exam.examTitle}</TableCell>
                                <TableCell>{exam.score ?? "-"}</TableCell>
                                <TableCell>{exam.attempts ?? "-"}</TableCell>
                                <TableCell>{exam.correct ?? "-"}</TableCell>
                                <TableCell>{exam.incorrect ?? "-"}</TableCell>
                                <TableCell>{exam.unanswered ?? "-"}</TableCell>
                                <TableCell>{exam.timeSpent ?? "-"}</TableCell>
                                <TableCell>
                                  {exam.accuracy !== undefined &&
                                  exam.accuracy !== null
                                    ? `${exam.accuracy}%`
                                    : "-"}
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

                      {/* SUBJECT WISE SUMMARY */}
                      {exam.subjectSummary?.length > 0 && (
                        <Box sx={{ padding: "20px" }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{ color: "text.primary" }}
                            >
                              Subject Wise Analysis
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
                                {exam.subjectSummary.map((sub: any) => (
                                  <TableRow key={sub.subject} hover>
                                    <TableCell>{sub.subject}</TableCell>
                                    <TableCell>{sub.total}</TableCell>
                                    <TableCell>{sub.correct}</TableCell>
                                    <TableCell>{sub.wrong}</TableCell>
                                    <TableCell>{sub.unanswered}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
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
                            Attempts
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
                            Time
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Accuracy
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((exam: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{exam.examTitle}</TableCell>
                            <TableCell>{exam.score ?? "-"}</TableCell>
                            <TableCell>{exam.attempts ?? "-"}</TableCell>
                            <TableCell>{exam.correct ?? "-"}</TableCell>
                            <TableCell>{exam.incorrect ?? "-"}</TableCell>
                            <TableCell>{exam.unanswered ?? "-"}</TableCell>
                            <TableCell>{exam.timeSpent ?? "-"}</TableCell>
                            <TableCell>
                              {exam.accuracy !== undefined &&
                              exam.accuracy !== null
                                ? `${exam.accuracy}%`
                                : "-"}
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
