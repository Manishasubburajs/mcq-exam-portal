"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const TEXT_PRIMARY = "#1e293b";
const TEXT_SECONDARY = "#64748b";
const PRIMARY_PURPLE = "#2f13c9ff";
const SUCCESS_GREEN = "#22c55e";
const DANGER_RED = "#ef4444";

interface Attempt {
  attemptNumber: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: string;
  points: string;
  result: string;
  completedAt: string;
}

interface AttemptHistoryModalProps {
  open: boolean;
  examName: string;
  examId: number;
  onClose: () => void;
}

export default function AttemptHistoryModal({
  open,
  examName,
  examId,
  onClose,
}: AttemptHistoryModalProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && examId) {
      fetchAttempts();
    }
  }, [open, examId]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`/api/students/attempts?examId=${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAttempts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch attempt history:", error);
    } finally {
      setLoading(false);
    }
  };
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
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          maxWidth: "90vw",
          width: "auto",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          fontWeight: "bold",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        Attempt History
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Paper elevation={1} sx={{ borderRadius: "10px", overflow: "hidden" }}>
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
              {examName}{" "}
            </Typography>
          </Box>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="attempt history table">
                  <TableHead
                    sx={{
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Attempt Number
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Correct Answers
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Wrong Answers
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Unanswered Questions
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Score
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Result
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: TEXT_PRIMARY,
                          fontSize: "0.875rem",
                          padding: "16px 20px",
                        }}
                      >
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow
                        key={attempt.attemptNumber}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { backgroundColor: "#f8f9fa" },
                        }}
                      >
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          Attempt {attempt.attemptNumber}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          {attempt.correctAnswers}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          {attempt.wrongAnswers}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          {attempt.unanswered}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          {attempt.score}/{attempt.points}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Box
                            sx={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontWeight: 600,
                            }}
                          >
                            <Chip
                              label={
                                (attempt.result || "fail").charAt(0).toUpperCase() +
                                (attempt.result || "fail").slice(1)
                              }
                              color={
                                (attempt.result || "fail").toLowerCase() === "pass"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "16px 20px",
                            color: TEXT_PRIMARY,
                            fontSize: "0.875rem",
                          }}
                        >
                          {attempt.completedAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {attempts.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "40px",
                    color: TEXT_SECONDARY,
                  }}
                >
                  <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                    No attempts found
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
