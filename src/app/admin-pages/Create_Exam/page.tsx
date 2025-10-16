"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

interface Question {
  question_id?: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
  subject_id: number;
  difficulty: string;
  isDraft?: boolean;
}

interface DraftExam {
  exam_id: number;
  exam_title: string;
  subject_id: number;
  question_count: number;
}

export default function CreateExam() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width:768px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => setSidebarOpen(isDesktop), [isDesktop]);

  const [examData, setExamData] = useState({
    exam_id: 0,
    title: "",
    subject_id: 0,
    timeLimit: 30,
    totalMarks: 100,
    startDate: "",
    endDate: "",
    description: "",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [draftExams, setDraftExams] = useState<DraftExam[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [newQuestion, setNewQuestion] = useState<Question>({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    points: 1,
    subject_id: 0,
    difficulty: "Medium",
    isDraft: false,
  });

  // Auto set start/end date
  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    setExamData((prev) => ({
      ...prev,
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16),
    }));
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setExamData((prev) => ({ ...prev, [field]: value }));
  };

  // Add or update question
  const handleSaveQuestion = () => {
    if (
      !newQuestion.question_text ||
      !newQuestion.option_a ||
      !newQuestion.option_b ||
      !newQuestion.option_c ||
      !newQuestion.option_d ||
      !newQuestion.correct_answer
    ) {
      alert("Please fill all question fields!");
      return;
    }

    const questionWithDraft = {
      ...newQuestion,
      question_id: newQuestion.question_id || questions.length + 1,
      isDraft: false,
    };

    if (editMode && editIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editIndex] = questionWithDraft;
      setQuestions(updatedQuestions);
      setEditMode(false);
      setEditIndex(null);
    } else {
      setQuestions((prev) => [...prev, questionWithDraft]);
    }

    setOpenModal(false);
    setNewQuestion({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      points: 1,
      subject_id: examData.subject_id,
      difficulty: "Medium",
      isDraft: false,
    });
  };

  const handleEditQuestion = (index: number) => {
    setNewQuestion(questions[index]);
    setEditIndex(index);
    setEditMode(true);
    setOpenModal(true);
  };

  const handleRemoveQuestion = (id?: number) => {
    setQuestions((prev) => prev.filter((q) => q.question_id !== id));
  };

  // Save exam (draft or publish)
  const handleSaveExam = async (status: "draft" | "published") => {
    if (!examData.title || examData.subject_id === 0) {
      alert("Please fill all required fields!");
      return;
    }

    const mapCorrectAnswer = (q: Question) => {
      if (q.correct_answer === q.option_a) return "A";
      if (q.correct_answer === q.option_b) return "B";
      if (q.correct_answer === q.option_c) return "C";
      if (q.correct_answer === q.option_d) return "D";
      throw new Error("Correct answer does not match any option");
    };

    const payload = {
      exam_title: examData.title,
      description: examData.description,
      subject_id: examData.subject_id,
      time_limit_minutes: examData.timeLimit,
      total_marks: examData.totalMarks,
      scheduled_start: examData.startDate,
      scheduled_end: examData.endDate,
      created_by: 1,
      status,
      questions: questions.map((q) => ({
        ...q,
        correct_answer: mapCorrectAnswer(q),
        isDraft: status === "draft" ? 1 : 0,
      })),
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          `Exam ${status === "draft" ? "saved as draft" : "published"} successfully!`
        );

        setQuestions([]);
        setExamData({
          exam_id: data.exam_id,
          title: "",
          subject_id: 0,
          timeLimit: 30,
          totalMarks: 100,
          startDate: "",
          endDate: "",
          description: "",
        });
        setShowDrafts(false);
      } else {
        alert(data.error || "Error saving exam! Please check your input.");
      }
    } catch (err) {
      console.error("Server error:", err);
      alert("Server error! Please try again later.");
    }
  };

  // =======================
  // Show Draft Exams (updated)
  // =======================
  const handleShowDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch(`/api/exams`);
      const data = await res.json();
      setDraftExams(data || []);
      setShowDrafts((prev) => !prev);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
    setLoadingDrafts(false);
  };

  // Load selected draft exam
  const handleLoadDraft = async (exam_id: number) => {
    try {
      const res = await fetch(`/api/exams/${exam_id}`);
      const data = await res.json();
      if (data.success) {
        const exam = data.data;
        setExamData({
          exam_id: exam.exam_id,
          title: exam.exam_title,
          subject_id: exam.subject_id,
          timeLimit: exam.time_limit_minutes,
          totalMarks: exam.total_marks,
          startDate: exam.scheduled_start.slice(0, 16),
          endDate: exam.scheduled_end.slice(0, 16),
          description: exam.description || "",
        });
        setQuestions(exam.questions || []);
        setShowDrafts(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Sidebar isOpen={sidebarOpen} />
      <Box className="main-content" sx={{ paddingTop: { xs: "50px", md: "80px" }, width: "100%" }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Create New Exam" sidebarOpen={sidebarOpen} />

        {/* Exam Form */}
        <Paper sx={{ padding: "25px", borderRadius: "10px", marginBottom: "30px" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Exam Details</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            <TextField label="Exam Title" value={examData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
            <FormControl>
              <InputLabel>Subject</InputLabel>
              <Select value={examData.subject_id} onChange={(e) => handleInputChange("subject_id", Number(e.target.value))} required>
                <MenuItem value={0}>Select Subject</MenuItem>
                <MenuItem value={1}>Mathematics</MenuItem>
                <MenuItem value={2}>Science</MenuItem>
                <MenuItem value={3}>English</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Time Limit (minutes)" type="number" value={examData.timeLimit} onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value))} required />
            <TextField label="Total Marks" type="number" value={examData.totalMarks} onChange={(e) => handleInputChange("totalMarks", parseInt(e.target.value))} required />
            <TextField label="Start Date & Time" type="datetime-local" value={examData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="End Date & Time" type="datetime-local" value={examData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Description" multiline rows={4} value={examData.description} onChange={(e) => handleInputChange("description", e.target.value)} sx={{ gridColumn: "1 / -1" }} />
          </Box>
        </Paper>

        {/* Questions Section */}
        <Paper sx={{ padding: "25px", borderRadius: "10px", backgroundColor: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Exam Questions</Typography>
            <Box>
              <Button variant="outlined" sx={{ mr: 1 }} onClick={() => setOpenModal(true)}>+ Add Question</Button>
              <Button variant="outlined" sx={{ mr: 1 }} onClick={() => handleSaveExam("draft")}>Save as Draft</Button>
              <Button variant="contained" sx={{ mr: 1 }} onClick={() => handleSaveExam("published")}>Publish Exam</Button>
              <Button variant="contained" onClick={handleShowDrafts}>
                {showDrafts ? "Hide Drafts" : "Show Drafts"}
              </Button>
            </Box>
          </Box>

          {questions.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>No questions added yet</Typography>
          ) : (
            questions.map((q, i) => (
              <Card key={i} sx={{ mb: 2, backgroundColor: "#f9f9f9" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontWeight: "bold" }}>{i + 1}. {q.question_text}</Typography>
                    <Typography>{q.points} points</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                      📊 {q.difficulty} &nbsp;&nbsp; ✅ Correct Answer: {q.correct_answer}
                    </Typography>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleEditQuestion(i)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleRemoveQuestion(q.question_id)}><Delete /></IconButton>
                    </Box>
                  </Box>
                  {["option_a", "option_b", "option_c", "option_d"].map((optKey) => (
                    <Typography key={optKey} sx={{
                      color: q.correct_answer === (q as any)[optKey] ? "green" : "#555",
                      fontWeight: q.correct_answer === (q as any)[optKey] ? "bold" : "normal",
                      mb: 0.5
                    }}>
                      {(optKey === "option_a" && "A.") || (optKey === "option_b" && "B.") || (optKey === "option_c" && "C.") || (optKey === "option_d" && "D.")} {(q as any)[optKey]}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </Paper>

        {/* Draft Exams Cards */}
        {showDrafts && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Draft Exams</Typography>
            {loadingDrafts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : draftExams.length === 0 ? (
              <Typography color="text.secondary">No draft exams found.</Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
                {draftExams.map((draft) => (
                  <Card key={draft.exam_id} sx={{ p: 2, borderRadius: 2, boxShadow: 2, transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-3px)", boxShadow: 4 } }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "primary.main" }}>{draft.exam_title}</Typography>
                      <Typography sx={{ mt: 1 }}>
                        <strong>Subject:</strong> {draft.subject_id === 1 ? "Mathematics" : draft.subject_id === 2 ? "Science" : "English"}
                      </Typography>
                      <Typography><strong>Questions:</strong> {draft.question_count}</Typography>
                      <Box sx={{ mt: 2, textAlign: "right" }}>
                        <Button variant="contained" size="small" onClick={() => handleLoadDraft(draft.exam_id)}>Load Draft</Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Add/Edit Question Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? "Edit Question" : "Add New Question"}</DialogTitle>
          <DialogContent dividers>
            <TextField label="Question Text" fullWidth margin="dense" value={newQuestion.question_text} onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })} />
            <TextField label="Option A" fullWidth margin="dense" value={newQuestion.option_a} onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })} />
            <TextField label="Option B" fullWidth margin="dense" value={newQuestion.option_b} onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })} />
            <TextField label="Option C" fullWidth margin="dense" value={newQuestion.option_c} onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })} />
            <TextField label="Option D" fullWidth margin="dense" value={newQuestion.option_d} onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Correct Answer</InputLabel>
              <Select value={newQuestion.correct_answer} onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}>
                <MenuItem value="A">{newQuestion.option_a}</MenuItem>
                <MenuItem value="B">{newQuestion.option_b}</MenuItem>
                <MenuItem value="C">{newQuestion.option_c}</MenuItem>
                <MenuItem value="D">{newQuestion.option_d}</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Points" type="number" fullWidth margin="dense" value={newQuestion.points} onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })} />
            <FormControl fullWidth margin="dense">
              <InputLabel>Difficulty</InputLabel>
              <Select value={newQuestion.difficulty} onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveQuestion}>{editMode ? "Update Question" : "Save Question"}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}