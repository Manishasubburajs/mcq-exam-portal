"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Typography,
  Box,
  Pagination,
  Alert,
  TableContainer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ResultRow {
  attempt_id: number;
  username: string;
  score: number;
  rank: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  examId: number;
}

const ExamResultsModal: React.FC<Props> = ({ open, onClose, examId }) => {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const fetchResults = async (page: number) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/exams/${examId}/results?page=${page}&limit=${limit}`,
      );

      const data = await res.json();

      if (res.ok) {
        setResults(data.data || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.message || "Failed to fetch results");
      }
    } catch (err) {
      console.error("Results fetch error:", err);
      setError("Something went wrong while fetching results");
    }

    setLoading(false);
  };

  // Fetch when modal opens
  useEffect(() => {
    if (open && examId) {
      setCurrentPage(1);
      fetchResults(1);
    }
  }, [open, examId]);

  const handlePageChange = (_: any, page: number) => {
    fetchResults(page);
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        Exam Results
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : results.length === 0 ? (
          <Typography align="center" sx={{ py: 3 }}>
            No results available
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={row.attempt_id}>
                      <TableCell>
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>{row.rank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
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

export default ExamResultsModal;
