"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

export default function QuestionBankPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [openModal, setOpenModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question_id: 0,
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    points: 1,
    subject_id: 0,
    difficulty: "Medium",
  });

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) setSubjects(data);
      else if (Array.isArray(data.data)) setSubjects(data.data);
      else setSubjects([]);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  const subjectColors: { [key: string]: { bg: string; text: string } } = {
    Math: { bg: "#e0f7fa", text: "#006064" },
    Physics: { bg: "#fce4ec", text: "#880e4f" },
    Chemistry: { bg: "#fff3e0", text: "#e65100" },
    Biology: { bg: "#e8f5e9", text: "#1b5e20" },
  };

  const getSubjectColor = (subject: string) => subjectColors[subject]?.bg || "#f5f7fa";
  const getSubjectTextColor = (subject: string) => subjectColors[subject]?.text || "#2c3e50";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const handleAddQuestion = () => {
    setNewQuestion({
      question_id: 0,
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      points: 1,
      subject_id: 0,
      difficulty: "Medium",
    });
    setIsEditMode(false);
    setOpenModal(true);
  };

  const handleEditQuestion = (q: any) => {
    setNewQuestion({
      question_id: q.question_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      points: q.points,
      subject_id: q.subject_id,
      difficulty: q.difficulty,
    });
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleSaveQuestion = async () => {
    if (
      !newQuestion.question_text ||
      !newQuestion.option_a ||
      !newQuestion.option_b ||
      !newQuestion.option_c ||
      !newQuestion.option_d ||
      !newQuestion.correct_answer ||
      newQuestion.subject_id === 0
    ) {
      alert("Please fill all required fields!");
      return;
    }

    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch("/api/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Question ${isEditMode ? "updated" : "added"} successfully!`);
        setOpenModal(false);
        fetchQuestions();
      } else {
        alert(`❌ ${data.error || "Failed to save question"}`);
      }
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Something went wrong. Try again.");
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) fetchQuestions();
      else alert(data.error || "Failed to delete question");
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
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
          title="Question Bank"
          sidebarOpen={sidebarOpen}
        />

        <Paper elevation={1} sx={{ p: 3, borderRadius: "10px", backgroundColor: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">All Questions</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
              onClick={handleAddQuestion}
            >
              Add Question
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedQuestions.map((q) => (
                    <TableRow key={q.question_id}>
                      <TableCell>{q.question_id}</TableCell>
                      <TableCell>
                        <Tooltip title={q.question_text}>
                          <span>{q.question_text?.slice(0, 50)}...</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={q.subject_name || "N/A"}
                          sx={{
                            backgroundColor: getSubjectColor(q.subject_name),
                            color: getSubjectTextColor(q.subject_name),
                            fontWeight: "600",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={q.difficulty} color={getDifficultyColor(q.difficulty)} />
                      </TableCell>
                      <TableCell>
                        <IconButton sx={{ color: "#1976d2" }} onClick={() => handleViewQuestion(q)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton sx={{ color: "#2575fc" }} onClick={() => handleEditQuestion(q)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton sx={{ color: "#f44336" }} onClick={() => handleDeleteQuestion(q.question_id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={Math.ceil(questions.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
            />
          </Box>
        </Paper>

        {/* Add/Edit Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isEditMode ? "Edit Question" : "Add New Question"}</DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense">
              <InputLabel>Subject</InputLabel>
              <Select
                value={newQuestion.subject_id}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, subject_id: Number(e.target.value) })
                }
              >
                <MenuItem value={0}>Select Subject</MenuItem>
                {subjects.map((sub) => (
                  <MenuItem key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Question Text"
              fullWidth
              margin="dense"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
            />
            <TextField
              label="Option A"
              fullWidth
              margin="dense"
              value={newQuestion.option_a}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
            />
            <TextField
              label="Option B"
              fullWidth
              margin="dense"
              value={newQuestion.option_b}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
            />
            <TextField
              label="Option C"
              fullWidth
              margin="dense"
              value={newQuestion.option_c}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
            />
            <TextField
              label="Option D"
              fullWidth
              margin="dense"
              value={newQuestion.option_d}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              >
                <MenuItem value={newQuestion.option_a}>A: {newQuestion.option_a}</MenuItem>
                <MenuItem value={newQuestion.option_b}>B: {newQuestion.option_b}</MenuItem>
                <MenuItem value={newQuestion.option_c}>C: {newQuestion.option_c}</MenuItem>
                <MenuItem value={newQuestion.option_d}>D: {newQuestion.option_d}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Points"
              type="number"
              fullWidth
              margin="dense"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              >
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveQuestion}>
              {isEditMode ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>View Question</DialogTitle>
          <DialogContent dividers>
            {selectedQuestion && (
              <Box>
                <Typography sx={{ mb: 1 }}><b>Question:</b> {selectedQuestion.question_text}</Typography>
                <Typography>A: {selectedQuestion.option_a}</Typography>
                <Typography>B: {selectedQuestion.option_b}</Typography>
                <Typography>C: {selectedQuestion.option_c}</Typography>
                <Typography>D: {selectedQuestion.option_d}</Typography>
                <Typography sx={{ mt: 2 }}><b>Correct Answer:</b> {selectedQuestion.correct_answer}</Typography>
                <Typography><b>Points:</b> {selectedQuestion.points}</Typography>
                <Typography><b>Difficulty:</b> {selectedQuestion.difficulty}</Typography>
                <Typography><b>Subject:</b> {selectedQuestion.subject_name}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
