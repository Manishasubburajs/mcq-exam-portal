"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Alert,
  Snackbar,
  Checkbox,
  styled,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Close,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";
import * as XLSX from "xlsx";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
}));

export default function QuestionBankPage() {
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
  const [searchParams, setSearchParams] = useState({
    subjectId: 0,
    topicId: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [openModal, setOpenModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Add Question Modal states
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const [uploadTypeSelection, setUploadTypeSelection] = useState<
    "select" | "individual" | "bulk" | null
  >(null);
  const [bulkQuestions, setBulkQuestions] = useState<any[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkValidationErrors, setBulkValidationErrors] = useState<string[]>(
    [],
  );
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkSelectedSubjectId, setBulkSelectedSubjectId] = useState<number>(0);
  const [bulkSelectedTopicId, setBulkSelectedTopicId] = useState<number>(0);
  const [bulkTopics, setBulkTopics] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const [newQuestion, setNewQuestion] = useState({
    question_id: 0,
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    points: 2,
    subject_id: 0,
    topic_id: 0,
    difficulty: "Medium",
    explanation: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ids: number[];
  }>({
    open: false,
    ids: [],
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkPreviewPage, setBulkPreviewPage] = useState(1);
  const BULK_PREVIEW_PAGE_SIZE = 10;

  const visibleDeletableIds = filteredQuestions
    .filter((q) => q.canDelete)
    .map((q) => q.question_id);

  const selectedVisibleIds = selectedIds.filter((id) =>
    visibleDeletableIds.includes(id),
  );

  const handleRowSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allDeletableIds = filteredQuestions
        .filter((q) => q.canDelete)
        .map((q) => q.question_id);

      setSelectedIds(allDeletableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const bulkFileInputRef = useRef<HTMLInputElement>(null);

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
      const subjectsData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];
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
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      setQuestions([]);
      showSnackbar("Failed to load questions", "error");
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  // Show table when subject or topic is selected
  useEffect(() => {
    setShowTable(true);
  }, []);

  // Filter questions based on search term, subject, and topic
  useEffect(() => {
    let filtered = [...questions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // q.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.difficulty?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by subject only if search clicked
    if (searchParams.subjectId) {
      filtered = filtered.filter(
        (q) => q.subject_id === searchParams.subjectId,
      );
    }

    // Filter by topic only if search clicked
    if (searchParams.topicId) {
      filtered = filtered.filter((q) => q.topic_id === searchParams.topicId);
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1);
  }, [questions, searchTerm, searchParams]);

  const subjectColors: { [key: string]: { bg: string; text: string } } = {
    Math: { bg: "#e0f7fa", text: "#006064" },
    Physics: { bg: "#fce4ec", text: "#880e4f" },
    Chemistry: { bg: "#fff3e0", text: "#e65100" },
    Biology: { bg: "#e8f5e9", text: "#1b5e20" },
  };

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

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success",
  ) => {
    setSnackbarOpen(false); // 🔴 reset first
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);

    // 🔁 reopen after state reset
    setTimeout(() => {
      setSnackbarOpen(true);
    }, 0);
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
      points: 2,
      subject_id: 0,
      topic_id: 0,
      difficulty: "Medium",
      explanation: "",
    });
    setValidationErrors({});
    setIsEditMode(false);
    setUploadTypeSelection("select");
    setAddQuestionModalOpen(true);
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
      explanation: q.explanation || "",
    });
    setValidationErrors({});
    setIsEditMode(true);

    // Load topics for the selected subject
    if (q.subject_id) {
      fetchTopicsForSubject(q.subject_id);
    }

    // Open the individual question modal directly
    setUploadTypeSelection("individual");
    setAddQuestionModalOpen(true);
  };

  const validateIndividualForm = () => {
    const errors: { [key: string]: string } = {};

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
    if (
      !newQuestion.correct_answer.trim() ||
      !["A", "B", "C", "D"].includes(
        newQuestion.correct_answer.trim().toUpperCase(),
      )
    ) {
      errors.correct_answer =
        "Please select a valid correct answer (A, B, C, or D)";
    }
    if (newQuestion.subject_id === 0) {
      errors.subject_id = "Subject is required";
    }

    if (
      newQuestion.subject_id &&
      (!newQuestion.topic_id || newQuestion.topic_id === 0)
    ) {
      errors.topic_id = "Topic is required";
    }

    // **New: Check for duplicate options**
    const options = [
      { key: "option_a", value: newQuestion.option_a },
      { key: "option_b", value: newQuestion.option_b },
      { key: "option_c", value: newQuestion.option_c },
      { key: "option_d", value: newQuestion.option_d },
    ];

    const seen: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.value && seen[opt.value]) {
        // mark both as duplicate
        errors[opt.key] = "Option must be unique";
        errors[seen[opt.value]] = "Option must be unique";
      } else if (opt.value) {
        seen[opt.value] = opt.key;
      }
    });

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
      setLoading(true);

      const res = await fetch("/api/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });
      const data = await res.json();
      if (res.ok) {
        setAddQuestionModalOpen(false);
        showSnackbar(
          `Question ${isEditMode ? "updated" : "added"} successfully!`,
          "success",
        );
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
          points: 2,
          subject_id: 0,
          topic_id: 0,
          difficulty: "Medium",
          explanation: "",
        });
        fetchQuestions();
      } else {
        showSnackbar(data.error || "Failed to save question", "error");
      }
    } catch (err) {
      console.error("Error saving question:", err);
      showSnackbar("Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteQuestions = async () => {
    const ids = deleteDialog.ids;
    if (!ids.length) return;

    try {
      setLoading(true);
      const res = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar(
          `${ids.length} question(s) deleted successfully`,
          "success",
        );

        setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
        fetchQuestions();
      } else {
        showSnackbar(data.error || "Failed to delete questions", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Something went wrong while deleting", "error");
    } finally {
      setDeleteDialog({ open: false, ids: [] });
      setLoading(false);
    }
  };

  const handleViewQuestion = (question: any) => {
    setSelectedQuestion(question);
    setViewModalOpen(true);
  };

  const validateField = (name: string, value: any) => {
    switch (name) {
      case "subject_id":
        return value && value !== 0 ? "" : "Subject is required";
      case "topic_id":
        return value && value !== 0 ? "" : "Topic is required";
      case "question_text":
        return value.trim() ? "" : "Question text is required";
      case "option_a":
        return value.trim() ? "" : "Option A is required";
      case "option_b":
        return value.trim() ? "" : "Option B is required";
      case "option_c":
        return value.trim() ? "" : "Option C is required";
      case "option_d":
        return value.trim() ? "" : "Option D is required";
      case "correct_answer":
        return value ? "" : "Please select the correct answer";
      default:
        return "";
    }
  };

  const validateUniqueOptions = (question: any) => {
    const errors: Record<string, string> = {};

    const options = [
      { key: "option_a", value: question.option_a.trim() },
      { key: "option_b", value: question.option_b.trim() },
      { key: "option_c", value: question.option_c.trim() },
      { key: "option_d", value: question.option_d.trim() },
    ];

    const seen: Record<string, string> = {};

    options.forEach((opt) => {
      if (!opt.value) return;

      if (seen[opt.value]) {
        errors[opt.key] = "Option must be unique";
        errors[seen[opt.value]] = "Option must be unique";
      } else {
        seen[opt.value] = opt.key;
      }
    });

    return errors;
  };

  // FILTER SUBJECT HANDLER (TABLE)
  const handleFilterSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0);

    if (subjectId) {
      fetchTopicsForSubject(subjectId);
    } else {
      setTopics([]);
    }

    setShowTable(true);
  };

  // FORM SUBJECT HANDLER (MODAL)
  const handleFormSubjectChange = (subjectId: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      subject_id: subjectId,
      topic_id: 0,
    }));
    setValidationErrors({ ...validationErrors, subject_id: "" });

    if (subjectId) {
      fetchTopicsForSubject(subjectId);
    } else {
      setTopics([]);
    }
  };

  const handleSearch = () => {
    // Store selected filters in searchParams
    setSearchParams({
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
    });

    // Show the table when search is performed
    setShowTable(true);

    setCurrentPage(1);
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

    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCsv && !isExcel) {
      showSnackbar("Please upload a CSV or Excel file", "error");
      return;
    }

    setBulkFile(file);
    if (isExcel) {
      parseExcelFile(file);
    } else {
      parseCSVFile(file);
    }
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split("\n").filter((line) => line.trim());
    const result: string[][] = [];
    for (const line of lines) {
      const row: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      result.push(row);
    }
    return result;
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const rows = parseCSV(csv);

        if (rows.length === 0) {
          setBulkValidationErrors(["File is empty"]);
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase().trim());

        const requiredFields = [
          "question_text",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_answer",
          "points",
          "difficulty",
          "explanation",
        ];
        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field),
        );

        if (missingFields.length > 0) {
          setBulkValidationErrors([
            `Missing required columns: ${missingFields.join(", ")}`,
          ]);
          return;
        }

        const questions: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (!values || !Array.isArray(values) || values.length === 0)
            continue;

          const nonEmptyCount = values.filter(
            (v) => v && String(v).trim() !== "",
          ).length;
          if (nonEmptyCount < 3) continue;

          const question: any = {};
          headers.forEach((header, index) => {
            const rawValue = values[index];
            question[header] = rawValue
              ? String(rawValue).replace(/^"|"$/g, "").trim()
              : "";
          });

          if (
            !question.question_text ||
            !question.option_a ||
            !question.option_b ||
            !question.option_c ||
            !question.option_d ||
            !question.correct_answer
          ) {
            console.log(`Row ${i + 1} missing fields:`, {
              question_text: question.question_text,
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              correct_answer: question.correct_answer,
              values: values,
            });
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          let difficultyValue = question.difficulty;
          if (!difficultyValue) {
            difficultyValue = "Medium";
          }

          const normalizedDifficulty = String(difficultyValue)
            .toLowerCase()
            .trim();

          const validDifficulties: Record<string, string> = {
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            e: "Easy",
            m: "Medium",
            h: "Hard",
            "1": "Easy",
            "2": "Medium",
            "3": "Hard",
            "ii-a": "Easy",
            "ii-b": "Easy",
            "ii-c": "Easy",
            "ii-d": "Easy",
            iii: "Medium",
            iv: "Hard",
            v: "Hard",
            vi: "Hard",
            vii: "Hard",
            viii: "Hard",
            ix: "Hard",
            x: "Hard",
            xi: "Hard",
            xii: "Hard",
          };

          const finalDifficulty =
            validDifficulties[normalizedDifficulty] || "Medium";

          questions.push({
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_answer: question.correct_answer,
            points: 2,
            difficulty: finalDifficulty,
            subject_id: 0,
            topic_id: 0,
            explanation: question.explanation || "",
          });
        }

        setBulkQuestions(questions);
        setBulkValidationErrors(errors);
        setShowBulkPreview(true);

        if (questions.length > 0) {
          showSnackbar(
            `Successfully parsed ${questions.length} questions`,
            "success",
          );
        }
      } catch (error) {
        setBulkValidationErrors([
          "Error parsing file. Please check the format.",
        ]);
      }
    };
    reader.readAsText(file);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
          | string
          | number
          | undefined
        )[][];

        if (rows.length === 0) {
          setBulkValidationErrors(["File is empty"]);
          return;
        }

        const headers = (rows[0] as (string | number)[]).map((h) =>
          String(h).toLowerCase().trim(),
        );

        const requiredFields = [
          "question_text",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
          "correct_answer",
          "points",
          "difficulty",
          "explanation",
        ];
        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field),
        );

        if (missingFields.length > 0) {
          setBulkValidationErrors([
            `Missing required columns: ${missingFields.join(", ")}`,
          ]);
          return;
        }

        const questions: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (!values || !Array.isArray(values)) continue;

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            const value = values[index];
            rowData[header] = value !== undefined ? String(value).trim() : "";
          });

          const hasData = Object.values(rowData).some(
            (v) => v && v.trim() !== "",
          );
          if (!hasData) continue;

          if (
            !rowData.question_text ||
            !rowData.option_a ||
            !rowData.option_b ||
            !rowData.option_c ||
            !rowData.option_d ||
            !rowData.correct_answer
          ) {
            console.log(`Excel Row ${i + 1} missing fields:`, {
              question_text: rowData.question_text,
              option_a: rowData.option_a,
              option_b: rowData.option_b,
              option_c: rowData.option_c,
              option_d: rowData.option_d,
              correct_answer: rowData.correct_answer,
              values: values,
            });
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          let difficultyValue = rowData.difficulty;
          if (!difficultyValue) {
            difficultyValue = "Medium";
          }

          const normalizedDifficulty = String(difficultyValue)
            .toLowerCase()
            .trim();
          const validDifficulties: Record<string, string> = {
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            e: "Easy",
            m: "Medium",
            h: "Hard",
            "1": "Easy",
            "2": "Medium",
            "3": "Hard",
            "ii-a": "Easy",
            "ii-b": "Easy",
            "ii-c": "Easy",
            "ii-d": "Easy",
            iii: "Medium",
            iv: "Hard",
            v: "Hard",
            vi: "Hard",
            vii: "Hard",
            viii: "Hard",
            ix: "Hard",
            x: "Hard",
            xi: "Hard",
            xii: "Hard",
          };

          const finalDifficulty =
            validDifficulties[normalizedDifficulty] || "Medium";

          questions.push({
            question_text: rowData.question_text,
            option_a: rowData.option_a,
            option_b: rowData.option_b,
            option_c: rowData.option_c,
            option_d: rowData.option_d,
            correct_answer: rowData.correct_answer,
            points: 2,
            difficulty: finalDifficulty,
            subject_id: 0,
            topic_id: 0,
            explanation: rowData.explanation || "",
          });
        }

        setBulkQuestions(questions);
        setBulkValidationErrors(errors);
        setShowBulkPreview(true);

        if (questions.length > 0) {
          showSnackbar(
            `Successfully parsed ${questions.length} questions`,
            "success",
          );
        }
      } catch (error) {
        setBulkValidationErrors([
          "Error parsing file. Please check the format.",
        ]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkQuestions.length === 0) {
      showSnackbar("No valid questions to upload", "error");
      return;
    }

    try {
      // Use pre-selected subject and topic for all questions
      if (!bulkSelectedSubjectId || !bulkSelectedTopicId) {
        showSnackbar(
          "Please select both subject and topic before bulk upload",
          "error",
        );
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
        explanation: q.explanation || "",
      }));

      setLoading(true);

      // Submit questions
      const res = await fetch("/api/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsWithIds }),
      });

      const data = await res.json();

      if (data.success) {
        showSnackbar(
          `Successfully uploaded ${questionsWithIds.length} questions!`,
          "success",
        );
        setAddQuestionModalOpen(false);
        setBulkFile(null);
        setBulkQuestions([]);
        setShowBulkPreview(false);
        setBulkValidationErrors([]);
        setUploadTypeSelection(null);
        fetchQuestions();
      } else {
        showSnackbar(`${data.error || "Bulk upload failed"}`, "error");
      }
    } catch (error: any) {
      showSnackbar(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (format: "csv" | "excel" = "csv") => {
    const templateData = [
      {
        question_text: "What is 2+2?",
        option_a: "3",
        option_b: "4",
        option_c: "5",
        option_d: "6",
        correct_answer: "B",
        points: 2,
        difficulty: "Easy",
        explanation: "The correct answer is 4 because 2+2 equals 4",
      },
      {
        question_text: "What is the capital of France?",
        option_a: "London",
        option_b: "Berlin",
        option_c: "Paris",
        option_d: "Madrid",
        correct_answer: "C",
        points: 2,
        difficulty: "Medium",
        explanation: "Paris is the capital city of France",
      },
      {
        question_text: "Who wrote Romeo and Juliet?",
        option_a: "Shakespeare",
        option_b: "Hemingway",
        option_c: "Tolstoy",
        option_d: "Dickens",
        correct_answer: "A",
        points: 2,
        difficulty: "Hard",
        explanation: "William Shakespeare wrote Romeo and Juliet",
      },
    ];

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
      XLSX.writeFile(workbook, "questions_template.xlsx");
    } else {
      const headers = [
        "question_text",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer",
        "points",
        "difficulty",
        "explanation",
      ];
      const csvRows = [headers.join(",")];
      templateData.forEach((row) => {
        const values = headers.map((h) => {
          const val = row[h as keyof typeof row];
          if (typeof val === "string" && val.includes(",")) {
            return `"${val}"`;
          }
          return val;
        });
        csvRows.push(values.join(","));
      });
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "questions_template.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    }
    showSnackbar(
      `${
        format === "excel" ? "Excel" : "CSV"
      } template downloaded successfully`,
      "success",
    );
  };

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
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
    setBulkPreviewPage(1);
    // Reset form
    setNewQuestion({
      question_id: 0,
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      points: 2,
      subject_id: 0,
      topic_id: 0,
      difficulty: "Medium",
      explanation: "",
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
      const subjectsData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];
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

  const handleBackFromUpload = () => {
    if (uploadTypeSelection === "individual") {
      setNewQuestion({
        question_id: 0,
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "",
        points: 2,
        subject_id: 0,
        topic_id: 0,
        difficulty: "Medium",
        explanation: "",
      });
      setValidationErrors({});
      setTopics([]);
    }

    if (uploadTypeSelection === "bulk") {
      setBulkQuestions([]);
      setBulkValidationErrors([]);
      setShowBulkPreview(false);
      setBulkFile(null);
      setBulkSelectedSubjectId(0);
      setBulkSelectedTopicId(0);
      setBulkTopics([]);
    }

    setUploadTypeSelection("select");
  };

  const resetBulkUpload = () => {
    setBulkFile(null);

    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    // Reset selection when subject or topic changes
    setSelectedIds([]);
  }, [selectedSubjectId, selectedTopicId]);

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}
    >
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
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        sx={{
          ml: sidebarOpen && isDesktop ? "220px" : 0,
          transition: "margin-left 0.3s ease",
          mt: 2,
          paddingTop: { xs: "50px", md: "80px" },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Question Bank"
          sidebarOpen={sidebarOpen}
        />

        <Paper
          elevation={1}
          sx={{ p: 3, borderRadius: "10px", backgroundColor: "white", mb: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Typography variant="h6">Search & Filter</Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
            >
              Add New Question
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
              mb: 2,
              mt: 3,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={selectedSubjectId}
                onChange={(e) =>
                  handleFilterSubjectChange(Number(e.target.value))
                }
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Paper>

        {/* Table Card - Separate Card */}
        {showTable && (
          <Paper
            elevation={1}
            sx={{ p: 3, borderRadius: "10px", backgroundColor: "white" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Search Results</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
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
                        <TableCell sx={{ fontWeight: "bold" }}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={
                                  visibleDeletableIds.length > 0 &&
                                  visibleDeletableIds.every((id) =>
                                    selectedIds.includes(id),
                                  )
                                }
                                indeterminate={
                                  selectedVisibleIds.length > 0 &&
                                  selectedVisibleIds.length <
                                    visibleDeletableIds.length
                                }
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                              />

                              {selectedIds.filter((id) =>
                                filteredQuestions.some(
                                  (q) => q.question_id === id,
                                ),
                              ).length > 0 && (
                                <Tooltip title="Delete selected questions">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      // handleDeleteQuestions(selectedVisibleIds)
                                      setDeleteDialog({
                                        open: true,
                                        ids: selectedVisibleIds,
                                      })
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            {/* Selected count */}
                            {selectedIds.length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1.5 }}
                              >
                                {
                                  selectedIds.filter((id) =>
                                    filteredQuestions.some(
                                      (q) => q.question_id === id,
                                    ),
                                  ).length
                                }{" "}
                                selected
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Questions
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Difficulty
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedQuestions.length > 0 ? (
                        paginatedQuestions.map((q, index) => (
                          <TableRow key={q.question_id} hover>
                            <TableCell>
                              {/* Delete */}
                              <Tooltip
                                title={
                                  q.canDelete
                                    ? "Delete Question"
                                    : "Cannot delete: question already used in exam"
                                }
                                arrow
                              >
                                <span>
                                  <Checkbox
                                    size="small"
                                    disabled={!q.canDelete}
                                    checked={selectedIds.includes(
                                      q.question_id,
                                    )}
                                    onChange={() =>
                                      handleRowSelect(q.question_id)
                                    }
                                  />
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={q.question_text}>
                                <span>
                                  {q.question_text?.slice(0, 80)}
                                  {q.question_text?.length > 80 ? "..." : ""}
                                </span>
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
                                {/* Edit */}
                                <Tooltip
                                  title={
                                    q.canEdit
                                      ? "Edit Question"
                                      : "Cannot edit: question already used in exam"
                                  }
                                  arrow
                                >
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      disabled={!q.canEdit}
                                      onClick={() => handleEditQuestion(q)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                            <Typography variant="body1" color="text.secondary">
                              {searchTerm ||
                              selectedSubjectId ||
                              selectedTopicId
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
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Paper>
        )}

        {/* Add/Edit Individual Modal */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense">
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={newQuestion.subject_id}
                onChange={(e) => {
                  const subjectId = Number(e.target.value);
                  handleFormSubjectChange(subjectId);
                  setValidationErrors({ ...validationErrors, subject_id: "" });
                }}
                label="Select Subject"
              >
                <MenuItem value={0}>Select Subject</MenuItem>
                {subjects.map((sub) => (
                  <MenuItem key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.subject_id && (
                <Typography color="error" variant="caption">
                  {validationErrors.subject_id}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Select Topic</InputLabel>
              <Select
                value={newQuestion.topic_id || 0}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    topic_id: Number(e.target.value),
                  })
                }
                label="Select Topic"
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
              onChange={(e) => {
                setNewQuestion({
                  ...newQuestion,
                  question_text: e.target.value,
                });
                setValidationErrors({ ...validationErrors, question_text: "" });
              }}
              error={!!validationErrors.question_text}
              helperText={validationErrors.question_text}
            />

            <TextField
              label="Option A"
              fullWidth
              margin="dense"
              value={newQuestion.option_a}
              onChange={(e) => {
                setNewQuestion({ ...newQuestion, option_a: e.target.value });
                setValidationErrors({ ...validationErrors, option_a: "" });
              }}
              error={!!validationErrors.option_a}
              helperText={validationErrors.option_a}
            />
            <TextField
              label="Option B"
              fullWidth
              margin="dense"
              value={newQuestion.option_b}
              onChange={(e) => {
                setNewQuestion({ ...newQuestion, option_b: e.target.value });
                setValidationErrors({ ...validationErrors, option_b: "" });
              }}
              error={!!validationErrors.option_b}
              helperText={validationErrors.option_b}
            />
            <TextField
              label="Option C"
              fullWidth
              margin="dense"
              value={newQuestion.option_c}
              onChange={(e) => {
                setNewQuestion({ ...newQuestion, option_c: e.target.value });
                setValidationErrors({ ...validationErrors, option_c: "" });
              }}
              error={!!validationErrors.option_c}
              helperText={validationErrors.option_c}
            />
            <TextField
              label="Option D"
              fullWidth
              margin="dense"
              value={newQuestion.option_d}
              onChange={(e) => {
                setNewQuestion({ ...newQuestion, option_d: e.target.value });
                setValidationErrors({ ...validationErrors, option_d: "" });
              }}
              error={!!validationErrors.option_d}
              helperText={validationErrors.option_d}
            />

            <FormControl
              fullWidth
              margin="dense"
              error={!!validationErrors.correct_answer}
            >
              <InputLabel>Correct Answer</InputLabel>
              <Select
                label="Correct Answer"
                value={newQuestion.correct_answer}
                onChange={(e) => {
                  setNewQuestion({
                    ...newQuestion,
                    correct_answer: e.target.value,
                  });
                  setValidationErrors({
                    ...validationErrors,
                    correct_answer: "",
                  });
                }}
              >
                <MenuItem value="A">A: {newQuestion.option_a}</MenuItem>
                <MenuItem value="B">B: {newQuestion.option_b}</MenuItem>
                <MenuItem value="C">C: {newQuestion.option_c}</MenuItem>
                <MenuItem value="D">D: {newQuestion.option_d}</MenuItem>
              </Select>
              {validationErrors.correct_answer && (
                <Typography color="error" variant="caption">
                  {validationErrors.correct_answer}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Explanation"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={newQuestion.explanation}
              onChange={(e) => {
                setNewQuestion({
                  ...newQuestion,
                  explanation: e.target.value,
                });
                setValidationErrors({ ...validationErrors, explanation: "" });
              }}
              error={!!validationErrors.explanation}
              helperText={validationErrors.explanation}
              placeholder="Provide an explanation for the correct answer (optional)"
            />

            <TextField
              label="Points"
              type="number"
              fullWidth
              margin="dense"
              value={newQuestion.points}
              disabled
              inputProps={{ min: 1 }}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Difficulty</InputLabel>
              <Select
                label="Difficulty"
                value={newQuestion.difficulty}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                }
              >
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenModal(false);
                setValidationErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveQuestion}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog
          open={viewModalOpen}
          onClose={(event, reason) => {
            // Prevent closing when clicking outside or pressing Escape
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            setViewModalOpen(false);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            View Question
            <IconButton onClick={() => setViewModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedQuestion && (
              <Box>
                {/* Question */}
                <Typography sx={{ mb: 1, fontWeight: 600 }}>
                  Question:
                </Typography>

                <Typography sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                  {selectedQuestion.question_text}
                </Typography>

                {/* Options */}
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  A. {selectedQuestion.option_a}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  B. {selectedQuestion.option_b}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  C. {selectedQuestion.option_c}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                  D. {selectedQuestion.option_d}
                </Typography>

                {/* Meta Info */}
                <Typography>
                  <b>Correct Answer:</b> {selectedQuestion.correct_answer}
                </Typography>
                <Typography>
                  <b>Points:</b> {selectedQuestion.points}
                </Typography>
                <Typography>
                  <b>Difficulty:</b> {selectedQuestion.difficulty}
                </Typography>
                <Typography>
                  <b>Subject:</b> {selectedQuestion.subject_name}
                </Typography>

                {/* Explanation */}
                {selectedQuestion.explanation && (
                  <>
                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Explanation:
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {selectedQuestion.explanation}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Questions Main Modal */}
        <Dialog
          open={addQuestionModalOpen}
          onClose={(event, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            handleCloseAddModal();
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
            {isEditMode ? "Edit Question" : "Add New Questions"}

            <IconButton onClick={handleCloseAddModal}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ minHeight: "50vh" }}>
            {uploadTypeSelection === "select" && !isEditMode && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Choose how you would like to add new questions:
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={uploadTypeSelection || ""}
                    onChange={(e) =>
                      setUploadTypeSelection(
                        e.target.value as "individual" | "bulk",
                      )
                    }
                  >
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">
                            Individual Question Upload
                          </Typography>
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
                          <Typography variant="subtitle1">
                            Bulk Upload
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Upload multiple questions from a Excel file.
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {uploadTypeSelection === "individual" && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {isEditMode
                    ? "Edit Individual Question"
                    : "Add Individual Question"}
                </Typography>

                <FormControl fullWidth margin="dense">
                  <InputLabel id="subject-select-label">
                    Select Subject
                  </InputLabel>
                  <Select
                    label="Select Subject"
                    labelId="subject-select-label"
                    value={newQuestion.subject_id}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      // Update question
                      setNewQuestion((prev) => ({
                        ...prev,
                        subject_id: value,
                        topic_id: 0, // reset topic
                      }));

                      // Validate immediately
                      setValidationErrors((prev) => ({
                        ...prev,
                        subject_id: validateField("subject_id", value),
                        topic_id: "", // clear topic error when subject changes
                      }));

                      fetchTopicsForSubject(value);
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
                    <Typography color="error" variant="caption">
                      {validationErrors.subject_id}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel>Select Topic</InputLabel>
                  <Select
                    label="Select Topic"
                    value={newQuestion.topic_id || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setNewQuestion((prev) => ({ ...prev, topic_id: value }));

                      // Validate immediately
                      setValidationErrors((prev) => ({
                        ...prev,
                        topic_id: validateField("topic_id", value),
                      }));
                    }}
                    disabled={!newQuestion.subject_id}
                  >
                    <MenuItem value={0}>Select Topic</MenuItem>
                    {topics.map((topic: any) => (
                      <MenuItem key={topic.topic_id} value={topic.topic_id}>
                        {topic.topic_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.topic_id && (
                    <Typography color="error" variant="caption">
                      {validationErrors.topic_id}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label="Question Text"
                  fullWidth
                  margin="dense"
                  multiline
                  rows={3}
                  value={newQuestion.question_text}
                  onChange={(e) => {
                    setNewQuestion({
                      ...newQuestion,
                      question_text: e.target.value,
                    });
                    setValidationErrors((prev) => ({
                      ...prev,
                      question_text: validateField(
                        "question_text",
                        e.target.value,
                      ),
                    }));
                  }}
                  error={!!validationErrors.question_text}
                  helperText={validationErrors.question_text}
                />

                <TextField
                  label="Option A"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_a}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedQuestion = {
                      ...newQuestion,
                      option_a: value,
                    };

                    setNewQuestion(updatedQuestion);

                    // Required validation
                    const fieldError = validateField("option_a", value);

                    // Recalculate duplicate errors
                    const duplicateErrors =
                      validateUniqueOptions(updatedQuestion);

                    setValidationErrors((prev) => ({
                      ...prev,
                      option_a: duplicateErrors.option_a || fieldError,
                      option_b: duplicateErrors.option_b || "",
                      option_c: duplicateErrors.option_c || "",
                      option_d: duplicateErrors.option_d || "",
                    }));
                  }}
                  error={!!validationErrors.option_a}
                  helperText={validationErrors.option_a}
                />
                <TextField
                  label="Option B"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_b}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedQuestion = {
                      ...newQuestion,
                      option_b: value,
                    };

                    setNewQuestion(updatedQuestion);

                    // Required validation
                    let fieldError = validateField("option_b", value);

                    // Duplicate validation
                    const duplicateErrors =
                      validateUniqueOptions(updatedQuestion);

                    setValidationErrors((prev) => ({
                      ...prev,
                      option_a: duplicateErrors.option_a || "",
                      option_b: duplicateErrors.option_b || fieldError,
                      option_c: duplicateErrors.option_c || "",
                      option_d: duplicateErrors.option_d || "",
                    }));
                  }}
                  error={!!validationErrors.option_b}
                  helperText={validationErrors.option_b}
                />
                <TextField
                  label="Option C"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_c}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedQuestion = {
                      ...newQuestion,
                      option_c: value,
                    };

                    setNewQuestion(updatedQuestion);

                    // Required validation
                    let fieldError = validateField("option_c", value);

                    // Duplicate validation
                    const duplicateErrors =
                      validateUniqueOptions(updatedQuestion);

                    setValidationErrors((prev) => ({
                      ...prev,
                      option_a: duplicateErrors.option_a || "",
                      option_b: duplicateErrors.option_b || "",
                      option_c: duplicateErrors.option_c || fieldError,
                      option_d: duplicateErrors.option_d || "",
                    }));
                  }}
                  error={!!validationErrors.option_c}
                  helperText={validationErrors.option_c}
                />
                <TextField
                  label="Option D"
                  fullWidth
                  margin="dense"
                  value={newQuestion.option_d}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedQuestion = {
                      ...newQuestion,
                      option_d: value,
                    };

                    setNewQuestion(updatedQuestion);

                    // Required validation
                    let fieldError = validateField("option_d", value);

                    // Duplicate validation
                    const duplicateErrors =
                      validateUniqueOptions(updatedQuestion);

                    setValidationErrors((prev) => ({
                      ...prev,
                      option_a: duplicateErrors.option_a || "",
                      option_b: duplicateErrors.option_b || "",
                      option_c: duplicateErrors.option_c || "",
                      option_d: duplicateErrors.option_d || fieldError,
                    }));
                  }}
                  error={!!validationErrors.option_d}
                  helperText={validationErrors.option_d}
                />

                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!validationErrors.correct_answer}
                >
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    label="Correct Answer"
                    value={newQuestion.correct_answer}
                    onChange={(e) => {
                      setNewQuestion({
                        ...newQuestion,
                        correct_answer: e.target.value,
                      });
                      setValidationErrors((prev) => ({
                        ...prev,
                        correct_answer: validateField(
                          "correct_answer",
                          e.target.value,
                        ),
                      }));
                    }}
                  >
                    <MenuItem value="A">A: {newQuestion.option_a}</MenuItem>
                    <MenuItem value="B">B: {newQuestion.option_b}</MenuItem>
                    <MenuItem value="C">C: {newQuestion.option_c}</MenuItem>
                    <MenuItem value="D">D: {newQuestion.option_d}</MenuItem>
                  </Select>
                  {validationErrors.correct_answer && (
                    <Typography color="error" variant="caption">
                      {validationErrors.correct_answer}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label="Explanation"
                  fullWidth
                  margin="dense"
                  multiline
                  rows={3}
                  value={newQuestion.explanation}
                  onChange={(e) => {
                    setNewQuestion({
                      ...newQuestion,
                      explanation: e.target.value,
                    });
                    setValidationErrors((prev) => ({
                      ...prev,
                      explanation: "",
                    }));
                  }}
                  error={!!validationErrors.explanation}
                  helperText={validationErrors.explanation}
                  placeholder="Provide an explanation for the correct answer (optional)"
                />

                <TextField
                  label="Points"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={newQuestion.points}
                  disabled
                  inputProps={{ min: 1 }}
                />

                <FormControl fullWidth margin="dense">
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    label="Difficulty"
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {uploadTypeSelection === "bulk" && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Bulk Upload Questions</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  (Select a subject and topic before uploading questions in
                  bulk.)
                </Typography>

                {/* Subject Selection */}
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                  <InputLabel>Select Subject *</InputLabel>
                  <Select
                    value={bulkSelectedSubjectId}
                    onChange={(e) =>
                      handleBulkSubjectChange(Number(e.target.value))
                    }
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
                <FormControl
                  fullWidth
                  margin="dense"
                  sx={{ mb: 3 }}
                  disabled={!bulkSelectedSubjectId}
                >
                  <InputLabel>Select Topic *</InputLabel>
                  <Select
                    value={bulkSelectedTopicId}
                    onChange={(e) =>
                      setBulkSelectedTopicId(Number(e.target.value))
                    }
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
                    Upload a Excel file containing your questions. Please ensure
                    the file follows the template format.
                  </Typography>
                </Alert>

                {/* Bulk Validation Errors */}
                {bulkValidationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">
                      Validation Errors:
                    </Typography>
                    {bulkValidationErrors.map((error, index) => (
                      <Typography key={index} variant="body2">
                        • {error}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {/* Download Template Buttons */}
                <Box sx={{ mb: 3 }}>
                  {/* <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTemplate("csv")}
                    sx={{ mr: 1 }}
                  >
                    Download CSV Template
                  </Button> */}
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTemplate("excel")}
                    sx={{ mr: 1 }}
                  >
                    Download Excel Template
                  </Button>
                </Box>

                {/* File Upload */}
                <Box sx={{ mb: 2 }}>
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="bulk-upload-input"
                  />
                  <Tooltip
                    title={
                      !bulkSelectedSubjectId
                        ? "Please select a subject to enable file upload"
                        : !bulkSelectedTopicId
                          ? "Please select a topic to enable file upload"
                          : "Upload file"
                    }
                    arrow
                  >
                    <span>
                      {bulkSelectedSubjectId && bulkSelectedTopicId ? (
                        <label htmlFor="bulk-upload-input">
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<UploadIcon />}
                          >
                            Choose File
                          </Button>
                        </label>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<UploadIcon />}
                          disabled
                        >
                          Choose File
                        </Button>
                      )}
                    </span>
                  </Tooltip>
                </Box>

                {bulkFile && (
                  <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    Selected file: {bulkFile.name}
                  </Typography>
                )}

                {/* Preview Table */}
                {showBulkPreview && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Preview ({bulkQuestions.length} questions)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Review your questions before submitting. Only valid
                      questions will be uploaded.
                    </Typography>

                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              S.No
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Question
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Topic
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Difficulty
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Points
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Correct Answer
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Explanation
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bulkQuestions
                            .slice(
                              (bulkPreviewPage - 1) * BULK_PREVIEW_PAGE_SIZE,
                              bulkPreviewPage * BULK_PREVIEW_PAGE_SIZE,
                            )
                            .map((q, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {(bulkPreviewPage - 1) *
                                    BULK_PREVIEW_PAGE_SIZE +
                                    index +
                                    1}
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={q.question_text}>
                                    <span>
                                      {q.question_text?.slice(0, 60)}
                                      {q.question_text?.length > 60
                                        ? "..."
                                        : ""}
                                    </span>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  {bulkTopics.find(
                                    (t) => t.topic_id === bulkSelectedTopicId,
                                  )?.topic_name || "Selected Topic"}
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
                                <TableCell>{q.explanation}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2">
                        Showing{" "}
                        {(bulkPreviewPage - 1) * BULK_PREVIEW_PAGE_SIZE + 1} to{" "}
                        {Math.min(
                          bulkPreviewPage * BULK_PREVIEW_PAGE_SIZE,
                          bulkQuestions.length,
                        )}{" "}
                        of {bulkQuestions.length} questions
                      </Typography>
                      <Pagination
                        count={Math.ceil(
                          bulkQuestions.length / BULK_PREVIEW_PAGE_SIZE,
                        )}
                        page={bulkPreviewPage}
                        onChange={(event, page) => setBulkPreviewPage(page)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              {!isEditMode &&
                (uploadTypeSelection === "individual" ||
                  (uploadTypeSelection === "bulk" && !showBulkPreview)) && (
                  <Button variant="outlined" onClick={handleBackFromUpload}>
                    Back
                  </Button>
                )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={handleCloseAddModal}>
                cancel
              </Button>

              {uploadTypeSelection === "individual" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveQuestion}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                  sx={{
                    "&.Mui-disabled": {
                      opacity: 1,
                      color: "white",
                      backgroundColor: "primary.main",
                    },
                  }}
                >
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                      ? "Update Question"
                      : "Save Question"}
                </Button>
              )}

              {uploadTypeSelection === "bulk" && showBulkPreview && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowBulkPreview(false);
                      resetBulkUpload();
                    }}
                  >
                    Back to Upload
                  </Button>
                  {bulkQuestions.length > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleBulkSubmit}
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : null
                      }
                      sx={{
                        "&.Mui-disabled": {
                          opacity: 1,
                          color: "white",
                          backgroundColor: "primary.main",
                        },
                      }}
                    >
                      {loading
                        ? "Uploading..."
                        : `Submit ${bulkQuestions.length} Questions`}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </DialogActions>
        </Dialog>

        <StyledDialog
          open={deleteDialog.open}
          onClose={(event, reason) => {
            // Prevent closing when clicking outside or pressing Escape
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            setDeleteDialog({ open: false, ids: [] });
          }}
          maxWidth="xs"
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
            Confirm Delete
          </DialogTitle>

          <DialogContent>
            <Typography>
              Are you sure you want to delete <b>{deleteDialog.ids.length}</b>{" "}
              selected question(s)?{" "}
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialog({
                  open: false,
                  ids: [],
                })
              }
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteQuestions}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : null
              }
              sx={{
                "&.Mui-disabled": {
                  opacity: 1,
                  color: "white",
                  backgroundColor: (theme) => theme.palette.error.main,
                },
              }}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </StyledDialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
