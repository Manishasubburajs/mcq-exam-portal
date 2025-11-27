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
  Search as SearchIcon,
} from "@mui/icons-material";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

export default function QuestionBankPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const [questions, setQuestions] = useState<any[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTable, setShowTable] = useState<boolean>(false);

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

  const fetchTopics = async (subjectId: number) => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      const subjectsData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      const subject = subjectsData.find((s: any) => s.subject_id === subjectId);
      if (subject) {
        setTopics(subject.topics || []);
      } else {
        setTopics([]);
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
      setTopics([]);
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

  // Filter questions based on search term, subject, and topic
  useEffect(() => {
    let filtered = [...questions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubjectId) {
      filtered = filtered.filter(q => q.subject_id === selectedSubjectId);
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [questions, searchTerm, selectedSubjectId, selectedTopicId]);

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

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0); // Reset topic selection
    if (subjectId) {
      fetchTopics(subjectId);
    } else {
      setTopics([]);
    }
  };

  const handleSearch = () => {
    // Show table when search is performed
    setShowTable(true);
  };

  const handleReset = () => {
    setSelectedSubjectId(0);
    setSelectedTopicId(0);
    setSearchTerm("");
    setTopics([]);
    setShowTable(false); // Hide table when reset
  };

  const paginatedQuestions = filteredQuestions.slice(
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
          transition: "margin-left 0.3s ease",mt:2,
          paddingTop: { xs: "50px", md: "80px" },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Question Bank"
          sidebarOpen={sidebarOpen}
        />

        <Paper elevation={1} sx={{ p: 3, borderRadius: "10px", backgroundColor: "white", mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Question Bank</Typography>
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

          {/* Search and Filter Controls */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: "10px", backgroundColor: "#f8f9fa" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Search & Filter</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Subject</InputLabel>
                <Select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(Number(e.target.value))}
                  label="Select Subject"
                >
                  <MenuItem value={0}>All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Select Topic</InputLabel>
                <Select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                  label="Select Topic"
                  disabled={!selectedSubjectId}
                >
                  <MenuItem value={0}>All Topics</MenuItem>
                  {topics.map((topic) => (
                    <MenuItem key={topic.topic_id} value={topic.topic_id}>
                      {topic.topic_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                Search
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Paper>
        </Paper>

        {/* Table Card - Separate Card */}
        {showTable && (
          <Paper elevation={1} sx={{ p: 3, borderRadius: "10px", backgroundColor: "white" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Search Results</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Filter results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }}
                  sx={{ minWidth: 250 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filteredQuestions.length} question(s) found
                </Typography>
              </Box>
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
                      <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Questions</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Difficulty</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedQuestions.length > 0 ? (
                        paginatedQuestions.map((q, index) => (
                          <TableRow key={q.question_id} hover>
                            <TableCell>
                              {((currentPage - 1) * itemsPerPage) + index + 1}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={q.question_text}>
                                <span>{q.question_text?.slice(0, 80)}{q.question_text?.length > 80 ? '...' : ''}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={q.difficulty} 
                                color={getDifficultyColor(q.difficulty)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="View" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleViewQuestion(q)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="secondary"
                                    onClick={() => handleEditQuestion(q)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteQuestion(q.question_id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                            <Typography variant="body1" color="text.secondary">
                              {searchTerm || selectedSubjectId || selectedTopicId 
                                ? "No Data Found" 
                                : "No questions available"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={Math.ceil(filteredQuestions.length / itemsPerPage)}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    disabled={filteredQuestions.length === 0}
                  />
                </Box>
              </>
            )}
          </Paper>
        )}

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
