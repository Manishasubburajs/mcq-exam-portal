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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
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
  
  // Add Question Modal states
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const [uploadTypeSelection, setUploadTypeSelection] = useState<'select' | 'individual' | 'bulk' | null>(null);
  const [bulkQuestions, setBulkQuestions] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkValidationErrors, setBulkValidationErrors] = useState<string[]>([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkSelectedSubjectId, setBulkSelectedSubjectId] = useState<number>(0);
  const [bulkSelectedTopicId, setBulkSelectedTopicId] = useState<number>(0);
  const [bulkTopics, setBulkTopics] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

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
    topic_id: 0,
    difficulty: "Medium",
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

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
      showSnackbar("Failed to load subjects", "error");
    }
  };

  const fetchTopicsForSubject = async (subjectId: number) => {
    if (!subjectId) {
      setTopics([]);
      return;
    }

    try {
      const res = await fetch(`/api/subjects`);
      const data = await res.json();
      const subjectsData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      const subject = subjectsData.find((s: any) => s.subject_id === subjectId);
      
      if (subject && subject.topics) {
        setTopics(subject.topics);
      } else {
        setTopics([]);
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
      setTopics([]);
      showSnackbar("Failed to load topics", "error");
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
      showSnackbar("Failed to load questions", "error");
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

    // Filter by topic
    if (selectedTopicId) {
      filtered = filtered.filter(q => q.topic_id === selectedTopicId);
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

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddQuestion = () => {
    // Reset individual form
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
      topic_id: 0,
      difficulty: "Medium",
    });
    setValidationErrors({});
    setIsEditMode(false);
    setUploadTypeSelection('select');
    setAddQuestionModalOpen(true);
  };

  const handleUploadTypeSelect = (type: 'individual' | 'bulk') => {
    setUploadTypeSelection(type);
    setBulkQuestions([]);
    setBulkValidationErrors([]);
    setShowBulkPreview(false);
    setBulkFile(null);
  };

  const handleEditQuestion = (q: any) => {
    // Reset form first
    setNewQuestion({
      question_id: q.question_id,
      question_text: q.question_text,
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_answer: q.correct_answer || "",
      points: q.points || 1,
      subject_id: q.subject_id || 0,
      topic_id: q.topic_id || 0,
      difficulty: q.difficulty || "Medium",
    });
    setValidationErrors({});
    setIsEditMode(true);
    
    // Load topics for the selected subject
    if (q.subject_id) {
      fetchTopicsForSubject(q.subject_id);
    }
    
    // Open the individual question modal directly
    setUploadTypeSelection('individual');
    setAddQuestionModalOpen(true);
  };

  const validateIndividualForm = () => {
    const errors: {[key: string]: string} = {};

    if (!newQuestion.question_text.trim()) {
      errors.question_text = "Question text is required";
    }
    if (!newQuestion.option_a.trim()) {
      errors.option_a = "Option A is required";
    }
    if (!newQuestion.option_b.trim()) {
      errors.option_b = "Option B is required";
    }
    if (!newQuestion.option_c.trim()) {
      errors.option_c = "Option C is required";
    }
    if (!newQuestion.option_d.trim()) {
      errors.option_d = "Option D is required";
    }
    if (!newQuestion.correct_answer.trim() || !['A', 'B', 'C', 'D'].includes(newQuestion.correct_answer.trim().toUpperCase())) {
      errors.correct_answer = "Please select a valid correct answer (A, B, C, or D)";
    }
    if (newQuestion.subject_id === 0) {
      errors.subject_id = "Subject is required";
    }
    if (!newQuestion.points || newQuestion.points <= 0) {
      errors.points = "Points must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQuestion = async () => {
    if (!validateIndividualForm()) {
      showSnackbar("Please fix the validation errors", "error");
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
        showSnackbar(`Question ${isEditMode ? "updated" : "added"} successfully!`, "success");
        setAddQuestionModalOpen(false);
        setUploadTypeSelection(null);
        setIsEditMode(false);
        // Reset form
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
          topic_id: 0,
          difficulty: "Medium",
        });
        fetchQuestions();
      } else {
        showSnackbar(data.error || "Failed to save question", "error");
      }
    } catch (err) {
      console.error("Error saving question:", err);
      showSnackbar("Something went wrong. Try again.", "error");
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
      if (res.ok) {
        showSnackbar("Question deleted successfully", "success");
        fetchQuestions();
      } else {
        showSnackbar(data.error || "Failed to delete question", "error");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete question", "error");
    }
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0); // Reset topic selection
    setNewQuestion({ ...newQuestion, subject_id: subjectId, topic_id: 0 });
    
    if (subjectId) {
      fetchTopicsForSubject(subjectId);
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

  // Bulk upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showSnackbar('Please upload a CSV or Excel file', 'error');
      return;
    }

    setBulkFile(file);
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setBulkValidationErrors(['File is empty']);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const requiredFields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'points', 'difficulty'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          setBulkValidationErrors([`Missing required columns: ${missingFields.join(', ')}`]);
          return;
        }

        const questions: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < headers.length) continue;

          const question: any = {};
          headers.forEach((header, index) => {
            question[header] = values[index] || '';
          });

          // Validate question
          if (!question.question_text || !question.option_a || !question.option_b || 
              !question.option_c || !question.option_d || !question.correct_answer) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Validate difficulty
          if (!['Easy', 'Medium', 'Hard'].includes(question.difficulty)) {
            errors.push(`Row ${i + 1}: Invalid difficulty level`);
            continue;
          }

          // Validate points
          const points = parseInt(question.points);
          if (isNaN(points) || points <= 0) {
            errors.push(`Row ${i + 1}: Invalid points value`);
            continue;
          }

          questions.push({
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_answer: question.correct_answer,
            points: points,
            difficulty: question.difficulty,
            subject_id: 0, // Will use pre-selected bulk subject
            topic_id: 0, // Will use pre-selected bulk topic
          });
        }

        setBulkQuestions(questions);
        setBulkValidationErrors(errors);
        setShowBulkPreview(true);
        
        if (questions.length > 0) {
          showSnackbar(`Successfully parsed ${questions.length} questions`, "success");
        }
      } catch (error) {
        setBulkValidationErrors(['Error parsing file. Please check the format.']);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkQuestions.length === 0) {
      showSnackbar('No valid questions to upload', 'error');
      return;
    }

    try {
      // Use pre-selected subject and topic for all questions
      if (!bulkSelectedSubjectId || !bulkSelectedTopicId) {
        showSnackbar("Please select both subject and topic before bulk upload", "error");
        return;
      }

      const questionsWithIds = bulkQuestions.map((q) => ({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        points: q.points,
        difficulty: q.difficulty,
        subject_id: bulkSelectedSubjectId,
        topic_id: bulkSelectedTopicId,
      }));

      // Submit questions
      const res = await fetch("/api/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsWithIds }),
      });

      const data = await res.json();
      
      if (data.success) {
        showSnackbar(`✅ Successfully uploaded ${questionsWithIds.length} questions!`, "success");
        setAddQuestionModalOpen(false);
        setBulkFile(null);
        setBulkQuestions([]);
        setShowBulkPreview(false);
        setBulkValidationErrors([]);
        setUploadTypeSelection(null);
        fetchQuestions();
      } else {
        showSnackbar(`❌ ${data.error || 'Bulk upload failed'}`, "error");
      }
    } catch (error: any) {
      showSnackbar(`❌ Error: ${error.message}`, "error");
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question_text,option_a,option_b,option_c,option_d,correct_answer,points,difficulty
"What is 2+2?","3","4","5","6","B",1,Easy
"What is the capital of France?","London","Berlin","Paris","Madrid","C",2,Medium
"Who wrote Romeo and Juliet?","Shakespeare","Hemingway","Tolstoy","Dickens","A",3,Hard`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    showSnackbar('Template downloaded successfully', 'success');
  };

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCloseAddModal = () => {
    setAddQuestionModalOpen(false);
    setUploadTypeSelection(null);
    setBulkQuestions([]);
    setBulkValidationErrors([]);
    setShowBulkPreview(false);
    setBulkFile(null);
    setBulkSelectedSubjectId(0);
    setBulkSelectedTopicId(0);
    setBulkTopics([]);
    setIsEditMode(false);
    // Reset form
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
      topic_id: 0,
      difficulty: "Medium",
    });
    setValidationErrors({});
  };

  const handleBulkSubjectChange = (subjectId: number) => {
    setBulkSelectedSubjectId(subjectId);
    setBulkSelectedTopicId(0); // Reset topic selection
    
    if (subjectId) {
      fetchTopicsForBulkSubject(subjectId);
    } else {
      setBulkTopics([]);
    }
  };

  const fetchTopicsForBulkSubject = async (subjectId: number) => {
    if (!subjectId) {
      setBulkTopics([]);
      return;
    }

    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      const subjectsData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      const subject = subjectsData.find((s: any) => s.subject_id === subjectId);
      
      if (subject && subject.topics) {
        setBulkTopics(subject.topics);
      } else {
        setBulkTopics([]);
      }
    } catch (err) {
      console.error("Error fetching topics for bulk upload:", err);
      setBulkTopics([]);
      showSnackbar("Failed to load topics", "error");
    }
  };

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
              Add New Question
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

        {/* Add/Edit Individual Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>{isEditMode ? "Edit Question" : "Add New Question"}</DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense">
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={newQuestion.subject_id}
                onChange={(e) => {
                  const subjectId = Number(e.target.value);
                  handleSubjectChange(subjectId);
                }}
              >
                <MenuItem value={0}>Select Subject</MenuItem>
                {subjects.map((sub) => (
                  <MenuItem key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.subject_id && (
                <Typography color="error" variant="caption">{validationErrors.subject_id}</Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Select Topic</InputLabel>
              <Select
                value={newQuestion.topic_id || 0}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, topic_id: Number(e.target.value) })
                }
                disabled={!newQuestion.subject_id}
              >
                <MenuItem value={0}>Select Topic</MenuItem>
                {topics.map((topic: any) => (
                  <MenuItem key={topic.topic_id} value={topic.topic_id}>
                    {topic.topic_name}
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
              error={!!validationErrors.question_text}
              helperText={validationErrors.question_text}
            />
            
            <TextField
              label="Option A"
              fullWidth
              margin="dense"
              value={newQuestion.option_a}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
              error={!!validationErrors.option_a}
              helperText={validationErrors.option_a}
            />
            <TextField
              label="Option B"
              fullWidth
              margin="dense"
              value={newQuestion.option_b}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
              error={!!validationErrors.option_b}
              helperText={validationErrors.option_b}
            />
            <TextField
              label="Option C"
              fullWidth
              margin="dense"
              value={newQuestion.option_c}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
              error={!!validationErrors.option_c}
              helperText={validationErrors.option_c}
            />
            <TextField
              label="Option D"
              fullWidth
              margin="dense"
              value={newQuestion.option_d}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
              error={!!validationErrors.option_d}
              helperText={validationErrors.option_d}
            />

            <FormControl fullWidth margin="dense" error={!!validationErrors.correct_answer}>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              >
                <MenuItem value="A">A: {newQuestion.option_a}</MenuItem>
                <MenuItem value="B">B: {newQuestion.option_b}</MenuItem>
                <MenuItem value="C">C: {newQuestion.option_c}</MenuItem>
                <MenuItem value="D">D: {newQuestion.option_d}</MenuItem>
              </Select>
              {validationErrors.correct_answer && (
                <Typography color="error" variant="caption">{validationErrors.correct_answer}</Typography>
              )}
            </FormControl>

            <TextField
              label="Points"
              type="number"
              fullWidth
              margin="dense"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
              error={!!validationErrors.points}
              helperText={validationErrors.points}
              inputProps={{ min: 1 }}
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
            <Button onClick={() => {
              setOpenModal(false);
              setValidationErrors({});
            }}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveQuestion}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 }
              }}
            >
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

        {/* Add Questions Main Modal */}
        <Dialog open={addQuestionModalOpen} onClose={handleCloseAddModal} maxWidth="lg" fullWidth>
          <DialogTitle>{isEditMode ? "Edit Question" : "Add New Questions"}</DialogTitle>
          <DialogContent dividers sx={{ minHeight: '500px' }}>
            {uploadTypeSelection === 'select' && !isEditMode && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Choose how you would like to add new questions:
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={uploadTypeSelection || ''}
                    onChange={(e) => setUploadTypeSelection(e.target.value as 'individual' | 'bulk')}
                  >
                    <FormControlLabel 
                      value="individual" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">Individual Question Upload</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add questions one by one with detailed form
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="bulk" 
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1">Bulk Upload</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Upload multiple questions from CSV or Excel file
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {uploadTypeSelection === 'individual' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Add Individual Question</Typography>
                
                <FormControl fullWidth margin="dense">
                  <InputLabel>Select Subject</InputLabel>
                  <Select
                    value={newQuestion.subject_id}
                    onChange={(e) => {
                      const subjectId = Number(e.target.value);
                      handleSubjectChange(subjectId);
                    }}
                  >
                    <MenuItem value={0}>Select Subject</MenuItem>
                    {subjects.map((sub) => (
                      <MenuItem key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.subject_id && (
                    <Typography color="error" variant="caption">{validationErrors.subject_id}</Typography>
                  )}
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel>Select Topic</InputLabel>
                  <Select
                    value={newQuestion.topic_id || 0}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, topic_id: Number(e.target.value) })
                    }
                    disabled={!newQuestion.subject_id}
                  >
                    <MenuItem value={0}>Select Topic</MenuItem>
                    {topics.map((topic: any) => (
                      <MenuItem key={topic.topic_id} value={topic.topic_id}>
                        {topic.topic_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Question Text"
                  fullWidth
                  margin="dense"
                  multiline
                  rows={3}
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  error={!!validationErrors.question_text}
                  helperText={validationErrors.question_text}
                />
                
                <TextField
                  label="Option A"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_a}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                  error={!!validationErrors.option_a}
                  helperText={validationErrors.option_a}
                />
                <TextField
                  label="Option B"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_b}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                  error={!!validationErrors.option_b}
                  helperText={validationErrors.option_b}
                />
                <TextField
                  label="Option C"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_c}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                  error={!!validationErrors.option_c}
                  helperText={validationErrors.option_c}
                />
                <TextField
                  label="Option D"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_d}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                  error={!!validationErrors.option_d}
                  helperText={validationErrors.option_d}
                />

                <FormControl fullWidth margin="dense" error={!!validationErrors.correct_answer}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  >
                    <MenuItem value="A">A: {newQuestion.option_a}</MenuItem>
                    <MenuItem value="B">B: {newQuestion.option_b}</MenuItem>
                    <MenuItem value="C">C: {newQuestion.option_c}</MenuItem>
                    <MenuItem value="D">D: {newQuestion.option_d}</MenuItem>
                  </Select>
                  {validationErrors.correct_answer && (
                    <Typography color="error" variant="caption">{validationErrors.correct_answer}</Typography>
                  )}
                </FormControl>

                <TextField
                  label="Points"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                  error={!!validationErrors.points}
                  helperText={validationErrors.points}
                  inputProps={{ min: 1 }}
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
              </Box>
            )}

            {uploadTypeSelection === 'bulk' && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Bulk Upload Questions</Typography>
                
                {/* Subject Selection */}
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                  <InputLabel>Select Subject *</InputLabel>
                  <Select
                    value={bulkSelectedSubjectId}
                    onChange={(e) => handleBulkSubjectChange(Number(e.target.value))}
                    label="Select Subject *"
                  >
                    <MenuItem value={0}>Select Subject</MenuItem>
                    {subjects.map((sub) => (
                      <MenuItem key={sub.subject_id} value={sub.subject_id}>
                        {sub.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Topic Selection */}
                <FormControl fullWidth margin="dense" sx={{ mb: 3 }} disabled={!bulkSelectedSubjectId}>
                  <InputLabel>Select Topic *</InputLabel>
                  <Select
                    value={bulkSelectedTopicId}
                    onChange={(e) => setBulkSelectedTopicId(Number(e.target.value))}
                    label="Select Topic *"
                  >
                    <MenuItem value={0}>Select Topic</MenuItem>
                    {bulkTopics.map((topic: any) => (
                      <MenuItem key={topic.topic_id} value={topic.topic_id}>
                        {topic.topic_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Upload Instructions */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    Upload a CSV or Excel file containing your questions. Please ensure the file follows the template format.
                  </Typography>
                </Alert>

                {/* Bulk Validation Errors */}
                {bulkValidationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Validation Errors:</Typography>
                    {bulkValidationErrors.map((error, index) => (
                      <Typography key={index} variant="body2">
                        • {error}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {/* Download Template Button */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={downloadTemplate}
                    sx={{ mr: 2 }}
                  >
                    Download Sample Template
                  </Button>
                </Box>

                {/* File Upload */}
                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="bulk-upload-input"
                  />
                  <label htmlFor="bulk-upload-input">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{
                        background: "linear-gradient(to right, #6a11cb, #2575fc)",
                        "&:hover": { opacity: 0.9 }
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                </Box>

                {bulkFile && (
                  <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    Selected file: {bulkFile.name}
                  </Typography>
                )}

                {/* Subject/Topic validation message */}
                {!bulkSelectedSubjectId && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please select a subject to continue with bulk upload.
                  </Alert>
                )}

                {bulkSelectedSubjectId && !bulkSelectedTopicId && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please select a topic to continue with bulk upload.
                  </Alert>
                )}

                {/* Preview Table */}
                {showBulkPreview && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Preview ({bulkQuestions.length} questions)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Review your questions before submitting. Only valid questions will be uploaded.
                    </Typography>
                    
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Topic</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Difficulty</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Points</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Correct Answer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bulkQuestions.slice(0, 10).map((q, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Tooltip title={q.question_text}>
                                  <span>{q.question_text?.slice(0, 60)}{q.question_text?.length > 60 ? '...' : ''}</span>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                {bulkTopics.find(t => t.topic_id === bulkSelectedTopicId)?.topic_name || 'Selected Topic'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={q.difficulty} 
                                  color={getDifficultyColor(q.difficulty)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{q.points}</TableCell>
                              <TableCell>{q.correct_answer}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {bulkQuestions.length > 10 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        ... and {bulkQuestions.length - 10} more questions
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            
            {uploadTypeSelection === 'select' && (
              <Button 
                variant="contained"
                disabled={!uploadTypeSelection || uploadTypeSelection === 'select'}
                onClick={() => {
                  // This will be handled by radio selection
                }}
              >
                Continue
              </Button>
            )}
            
            {uploadTypeSelection === 'individual' && (
              <Button
                variant="contained"
                onClick={handleSaveQuestion}
                sx={{
                  background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  "&:hover": { opacity: 0.9 }
                }}
              >
                {isEditMode ? "Update Question" : "Save Question"}
              </Button>
            )}
            
            {uploadTypeSelection === 'bulk' && !showBulkPreview && (
              <Button
                variant="outlined"
                onClick={() => setUploadTypeSelection('select')}
              >
                Back
              </Button>
            )}
            
            {uploadTypeSelection === 'bulk' && showBulkPreview && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setShowBulkPreview(false)}
                >
                  Back to Upload
                </Button>
                {bulkQuestions.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleBulkSubmit}
                    sx={{
                      background: "linear-gradient(to right, #6a11cb, #2575fc)",
                      "&:hover": { opacity: 0.9 }
                    }}
                  >
                    Submit {bulkQuestions.length} Questions
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
