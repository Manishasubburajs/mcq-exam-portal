"use client";

import React from "react";
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
  attempts: Attempt[];
  onClose: () => void;
}

export default function AttemptHistoryModal({
  open,
  examName,
  attempts,
  onClose,
}: AttemptHistoryModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontSize: "1.25rem",
          }}
        >
          {examName} - Attempt History
        </Typography>
        <Box
          sx={{
            cursor: "pointer",
            "&:hover": { opacity: 0.7 },
          }}
          onClick={onClose}
        >
          <CloseIcon sx={{ fontSize: "24px", color: TEXT_SECONDARY }} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: "24px" }}>
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
                        backgroundColor: attempt.result === "Pass" ? SUCCESS_GREEN : DANGER_RED,
                        color: "#fff",
                      }}
                    >
                      {attempt.result}
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
      </DialogContent>
    </Dialog>
  );
}
