"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  attemptId: number | null;
}

const StudentReviewModal = ({ open, onClose, attemptId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);

  useEffect(() => {
    if (!attemptId || !open) return;

    setLoading(true);
    setReviewData(null);

    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/students/review?attemptId=${attemptId}`);
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error);
          return;
        }

        setReviewData(data);
      } catch (err) {
        console.error("Review fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [attemptId, open]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing when clicking outside or pressing Escape
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        Exam Review
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : reviewData ? (
          <>
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
                  {reviewData.examTitle}{" "}
                </Typography>
              </Box>

              <Divider />
              <Box sx={{ padding: "20px" }}>
                {/* <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Default
                  </Typography>
                </Box> */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Default
                  </Typography>

                  {reviewData?.rank === 1 && (
                    <Chip
                      label="🏆 Topper"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  )}
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
                      <TableCell sx={{ fontWeight: "bold" }}>Rank #</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Accuracy
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Correct</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Incorrect
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Unanswered
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Attempts
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell
                        sx={{
                          backgroundColor: "grey.50",
                          fontWeight: "bold",
                        }}
                      >
                        You
                      </TableCell>
                      <TableCell>{reviewData.rank ?? "-"}</TableCell>
                      <TableCell>{reviewData.examTitle}</TableCell>
                      <TableCell>{reviewData.score ?? "-"}</TableCell>
                      <TableCell>
                        {reviewData.accuracy !== undefined &&
                        reviewData.accuracy !== null
                          ? `${reviewData.accuracy}%`
                          : "-"}
                      </TableCell>
                      <TableCell>{reviewData.correct ?? "-"}</TableCell>
                      <TableCell>{reviewData.incorrect ?? "-"}</TableCell>
                      <TableCell>{reviewData.unanswered ?? "-"}</TableCell>
                      <TableCell>{reviewData.attempts}</TableCell>
                      <TableCell>{reviewData.timeSpent ?? "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            reviewData.result?.charAt(0).toUpperCase() +
                            reviewData.result?.slice(1)
                          }
                          color={
                            reviewData.result?.toLowerCase() === "pass"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    {!(reviewData?.rank === 1) && (
                      <TableRow hover>
                        <TableCell
                          sx={{
                            backgroundColor: "grey.50",
                            fontWeight: "bold",
                          }}
                        >
                          Topper
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>{reviewData.examTitle}</TableCell>
                        <TableCell>{reviewData.topperScore ?? "-"}</TableCell>
                        <TableCell>
                          {reviewData.topperAccuracy !== undefined &&
                          reviewData.topperAccuracy !== null
                            ? `${reviewData.topperAccuracy}%`
                            : "-"}
                        </TableCell>
                        <TableCell>{reviewData.topperCorrect ?? "-"}</TableCell>
                        <TableCell>
                          {reviewData.topperIncorrect ?? "-"}
                        </TableCell>
                        <TableCell>
                          {reviewData.topperUnanswered ?? "-"}
                        </TableCell>
                        <TableCell>{reviewData.topperAttempt}</TableCell>
                        <TableCell>{reviewData.topperTime ?? "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              reviewData.topperResult?.charAt(0).toUpperCase() +
                              reviewData.topperResult?.slice(1)
                            }
                            color={
                              reviewData.topperResult?.toLowerCase() === "pass"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>

              <Box sx={{ padding: "20px" }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Topic Wise Analysis
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
                      <TableCell sx={{ fontWeight: "bold" }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Topic</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Correct</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Wrong</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Unanswered
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {reviewData.topicSummary.map((row: any, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.topic}</TableCell>
                        <TableCell>{row.total}</TableCell>
                        <TableCell>{row.correct}</TableCell>
                        <TableCell>{row.wrong}</TableCell>
                        <TableCell>{row.unanswered}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <Typography>No data available</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentReviewModal;
