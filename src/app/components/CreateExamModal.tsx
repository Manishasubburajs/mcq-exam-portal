"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useMemo, useEffect } from "react";
import * as Yup from "yup";

type ExamType = "practice" | "mock" | "live";

interface Topic {
  topic_id: number;
  topic_name: string;
  question_count: number;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  topics: Topic[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const generalInfoSchema = Yup.object({
  examTitle: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Exam title is required")
    .test(
      "min-length",
      "Exam title must be at least 3 characters",
      (value) => !value || value.length >= 3,
    ),
  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .nullable(),
  examType: Yup.string()
    .oneOf(["practice", "mock", "live"])
    .required("Exam type is required"),
});

const parseLocalDatetime = (value: string) => {
  if (!value) return new Date("");

  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
};

const rulesSchema = Yup.object({
  duration: Yup.number()
    .typeError("Duration must be a number")
    .required("Duration is required")
    .min(1, "Duration must be at least 1 minute")
    .max(300, "Duration cannot exceed 300 minutes"),

  startTime: Yup.string().when("examType", {
    is: "live",
    then: () =>
      Yup.string()
        .required("Start time is required")
        .test("not-past", "Start time must be now or later", (value) => {
          if (!value) return false;
          return parseLocalDatetime(value) >= new Date();
        }),
    otherwise: () => Yup.string().nullable(),
  }),

  endTime: Yup.string().when("examType", {
    is: "live",
    then: () =>
      Yup.string()
        .required("End time is required")
        .test(
          "after-start",
          "End time must be after start time",
          function (value) {
            const { startTime } = this.parent;
            if (!value || !startTime) return false;
            return parseLocalDatetime(value) >= parseLocalDatetime(startTime);
          },
        ),
    otherwise: () => Yup.string().nullable(),
  }),
});

export default function CreateExamModal({ open, onClose, onSuccess }: Props) {
  // Helper to format local datetime for input
  const toDatetimeLocal = (dateStr: string) => {
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  };

  const resetForm = () => {
    setActiveStep(0);
    setExamTitle("");
    setDescription("");
    setExamType("practice");
    setDuration("" as any);
    setStartTime("");
    setEndTime("");
    setSelectedSubjects([]);
    setTopicCounts({});
    setTopicErrors({});
    setFormErrors({});
    setDateErrors({});
    setQuestionsByTopic({});
    setSelectedQuestions([]);
    setLoadingTopics({});
    setSelectionMode("auto");
  };

  const [activeStep, setActiveStep] = useState(0);

  // STEP 1: General Info
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState<ExamType>("practice");

  // STEP 2: Rules
  const [duration, setDuration] = useState<number | "">("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // STEP 3: Questions
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">("auto");
  const [questionsByTopic, setQuestionsByTopic] = useState<
    Record<number, any[]>
  >({});
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [loadingTopics, setLoadingTopics] = useState<Record<number, boolean>>(
    {},
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});
  const [topicErrors, setTopicErrors] = useState<Record<number, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [existingExams, setExistingExams] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [pageByTopic, setPageByTopic] = useState<Record<number, number>>({});
  const [filterByTopic, setFilterByTopic] = useState<
    Record<number, "all" | "selected" | "unselected">
  >({});

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>(
    {},
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const steps = ["General Info", "Questions", "Rules", "Review"];

  const isPractice = examType === "practice";

  const totalQuestions =
    selectionMode === "manual"
      ? selectedQuestions.length
      : Object.values(topicCounts).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0,
        );

  const validateField = async (name: string, value: any) => {
    try {
      await generalInfoSchema.validateAt(name, {
        examTitle,
        description,
        examType,
        [name]: value,
      });

      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (err: any) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: err.message,
      }));
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setDuration("" as any);
      setFormErrors((prev) => ({
        ...prev,
        duration: "Duration is required",
      }));
      return;
    }

    const value = Number(rawValue);

    if (value < 1) {
      setFormErrors((prev) => ({
        ...prev,
        duration: "Duration must be at least 1 minute",
      }));
      setDuration(value);
      return;
    }

    setDuration(value);

    // Recalculate endTime if startTime exists
    if (!startTime) {
      setEndTime("");
    } else {
      const start = parseLocalDatetime(startTime);
      const end = new Date(start.getTime() + value * 60 * 1000); // add duration in minutes
      setEndTime(toDatetimeLocal(end.toISOString()));
    }

    // Yup validation
    rulesSchema
      .validateAt("duration", { duration: value, examType })
      .then(() => setFormErrors((prev) => ({ ...prev, duration: "" })))
      .catch((err) =>
        setFormErrors((prev) => ({ ...prev, duration: err.message })),
      );
  };

  const validateLiveDates = (start = startTime, end = endTime) => {
    if (examType !== "live") return true;

    const errors: Record<string, string> = {};
    const now = new Date();

    if (!start) {
      errors.startTime = "Start time is required";
    } else if (parseLocalDatetime(start) < now) {
      errors.startTime = "Start time must be now or later";
    }

    if (!end) {
      errors.endTime = "End time is required";
    } else if (start && parseLocalDatetime(end) < parseLocalDatetime(start)) {
      errors.endTime = "End time must be after start time";
    }

    setDateErrors(errors);

    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!open) return;

    setApiLoading(true);
    setLoadingSubjects(true);

    fetch("/api/questions/question-counts")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error(err))
      .finally(() => {
        setLoadingSubjects(false);
        setApiLoading(false);
      });
  }, [open]);

  // Toggle Subject
  const toggleSubject = (id: number) => {
    setExpandedTopics({});

    if (isPractice) {
      setSelectedSubjects([id]);
      setTopicCounts({});
      setTopicErrors({});

      setSelectedQuestions([]);
      setQuestionsByTopic({});
      setPageByTopic({});
      setSearchTerms({});
      // Clear errors for all other subjects
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subject;
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("subject_") && key !== `subject_${id}`) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    } else {
      setSelectedSubjects((prev) => {
        const isRemoving = prev.includes(id);

        const updated = isRemoving
          ? prev.filter((s) => s !== id)
          : [...prev, id];

        // 🚨 if subject is being unchecked
        if (isRemoving) {
          const subject = subjects.find((s) => s.subject_id === id);

          if (subject) {
            const topicIds = subject.topics.map((t) => t.topic_id);

            setQuestionsByTopic((prev) => {
              const updated = { ...prev };
              subject.topics.forEach((t) => delete updated[t.topic_id]);
              return updated;
            });

            // remove topic counts
            setTopicCounts((prevCounts) => {
              const updatedCounts = { ...prevCounts };
              topicIds.forEach((tid) => delete updatedCounts[tid]);
              return updatedCounts;
            });

            // remove topic errors
            setTopicErrors((prevErrors) => {
              const updatedErrors = { ...prevErrors };
              topicIds.forEach((tid) => delete updatedErrors[tid]);
              return updatedErrors;
            });

            // remove form errors
            setFormErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              delete newErrors[`subject_${id}`];
              return newErrors;
            });

            setSelectedQuestions((prev) =>
              prev.filter(
                (qid) =>
                  !subject?.topics.some((t) =>
                    (questionsByTopic[t.topic_id] || []).some(
                      (q) => q.question_id === qid,
                    ),
                  ),
              ),
            );
          }
        }

        // clear global subject error if at least one selected
        if (updated.length > 0) {
          setFormErrors((prevErr) => {
            const newErrors = { ...prevErr };
            delete newErrors.subject;
            return newErrors;
          });
        }

        return updated;
      });
    }
  };

  const handleTopicChange = (
    topicId: number,
    value: number | undefined,
    max: number,
  ) => {
    if (value === undefined) {
      setTopicCounts((prev) => {
        const updated = { ...prev };
        delete updated[topicId];
        return updated;
      });

      setTopicErrors((prev) => ({
        ...prev,
        [topicId]: "",
      }));

      return;
    }

    let error = "";
    if (value < 1) error = "Must be at least 1";
    else if (value > max) error = `Max available ${max}`;
    setTopicErrors((prev) => ({ ...prev, [topicId]: error }));
    setTopicCounts((prev) => ({ ...prev, [topicId]: value }));

    const subject = subjects.find((s) =>
      s.topics.some((t) => t.topic_id === topicId),
    );

    if (subject && !error && value > 0) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[`subject_${subject.subject_id}`];
        delete newErrors.totalQuestions;
        delete newErrors.topic;

        return newErrors;
      });
    }
  };

  const validateGeneralInfoStep = async () => {
    try {
      await generalInfoSchema.validate(
        { examTitle, description, examType },
        { abortEarly: false },
      );

      const normalized = examTitle.trim().toLowerCase();

      const exists = existingExams.some(
        (exam) => exam.exam_name.trim().toLowerCase() === normalized,
      );

      if (exists) {
        setFormErrors((prev) => ({
          ...prev,
          examTitle: "Exam title already exists",
        }));
        return false;
      }

      setFormErrors((prev) => ({
        ...prev,
        examTitle: "",
        description: "",
        examType: "",
      }));
      return true;
    } catch (err: any) {
      const errors: Record<string, string> = {};

      err.inner?.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });

      setFormErrors(errors);
      return false;
    }
  };

  const validateRulesStep = async () => {
    let isValid = true;

    try {
      await rulesSchema.validate(
        { duration, startTime, endTime, examType },
        { abortEarly: false },
      );

      setFormErrors((prev) => ({
        ...prev,
        duration: "",
      }));
    } catch (err: any) {
      const dateErrs: Record<string, string> = {};
      const formErrs: Record<string, string> = {};

      err.inner?.forEach((e: any) => {
        if (e.path === "duration") formErrs.duration = e.message;
        if (e.path === "startTime") dateErrs.startTime = e.message;
        if (e.path === "endTime") dateErrs.endTime = e.message;
      });

      setFormErrors((prev) => ({ ...prev, ...formErrs }));
      setDateErrors(dateErrs);

      isValid = false;
    }

    if (!validateLiveDates()) {
      isValid = false;
    }

    return isValid;
  };

  const validateQuestionsStep = () => {
    let isValid = true;
    const errors: Record<string, string> = {};

    // reset previous subject/topic errors
    setFormErrors((prev) => ({
      ...prev,
      subject: "",
    }));

    // 🚨 subject validation
    if (isPractice) {
      if (selectedSubjects.length !== 1) {
        errors.subject = "Please select one subject";
        isValid = false;
      }
    } else {
      if (selectedSubjects.length === 0) {
        errors.subject = "Please select at least one subject";
        isValid = false;
      }
    }

    // 🚨 atleast one topic per subject
    selectedSubjects.forEach((subjectId) => {
      const subject = subjects.find((s) => s.subject_id === subjectId);

      if (!subject) return;

      const hasAvailableTopics = subject.topics.some(
        (topic) => topic.question_count > 0,
      );

      if (!hasAvailableTopics) {
        errors[`subject_${subjectId}`] =
          "No questions available in this subject";
        isValid = false;
        return;
      }

      if (selectionMode === "manual") {
        // ✅ FIX: only show error if ZERO questions
        if (selectedQuestions.length === 0) {
          errors[`subject_${subjectId}`] =
            "Please select at least one question";
          isValid = false;
        }
      } else {
        const hasTopic = subject.topics.some(
          (topic) => (topicCounts[topic.topic_id] || 0) > 0,
        );

        // ✅ FIX: only show if no topic AND totalQuestions = 0
        if (!hasTopic && totalQuestions === 0) {
          errors[`subject_${subjectId}`] =
            "At least one topic must be assigned in this subject";
          isValid = false;
        }
      }
    });

    // 🚨 topic input errors
    const hasTopicErrors = Object.values(topicErrors).some(
      (err) => err && err.length > 0,
    );

    if (hasTopicErrors) {
      errors.topic = "Please fix topic errors";
      isValid = false;
    }

    if (selectionMode === "manual" && totalQuestions <= 0) {
      errors.totalQuestions = "Please select at least one question";
      isValid = false;
    }

    if (
      (examType === "mock" || examType === "live") &&
      totalQuestions > 0 &&
      totalQuestions !== 100
    ) {
      errors.totalQuestions = "Exam must contain exactly 100 questions";
      isValid = false;
    }

    setFormErrors(errors);

    return isValid;
  };

  const handleNext = async () => {
    let isValid = true;

    if (steps[activeStep] === "General Info") {
      isValid = await validateGeneralInfoStep();
    }

    if (steps[activeStep] === "Rules") {
      isValid = await validateRulesStep();
    }

    if (steps[activeStep] === "Questions") {
      isValid = validateQuestionsStep();
    }

    if (!isValid) return;

    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (steps[activeStep] === "Questions") {
      setFormErrors({});
    }
    setActiveStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // 🚀 Prevent double click
    setIsSubmitting(true); // 🔒 Lock button immediately

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const payload = {
      examTitle,
      description,
      examType,
      duration,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
      selectionMode,
      ...(selectionMode === "auto" ? { topicCounts } : { selectedQuestions }),
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSnackbar("Exam created successfully!", "success");
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        showSnackbar(data.message || "Failed to create exam", "error");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Error creating exam", "error");
    } finally {
      setIsSubmitting(false); // 🔓 Unlock button
    }
  };

  useEffect(() => {
    if (!open) return;

    setApiLoading(true);

    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => setExistingExams(data))
      .catch((err) => console.error(err))
      .finally(() => setApiLoading(false));
  }, [open]);

  const checkDuplicateTitle = (title: string) => {
    if (!title) return;

    const normalized = title.trim().toLowerCase();

    const exists = existingExams.some(
      (exam) => exam.exam_name.trim().toLowerCase() === normalized,
    );

    setFormErrors((prev) => ({
      ...prev,
      examTitle: exists ? "Exam title already exists" : "",
    }));
  };

  const formatReviewDateTime = (value: string) => {
    if (!value) return "Not set";

    const date = parseLocalDatetime(value);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (examType !== "practice") return;

    const calculatedDuration = Math.ceil(totalQuestions * 1.2);

    if (calculatedDuration > 0) {
      setDuration(calculatedDuration);
    } else {
      setDuration(0);
    }
  }, [totalQuestions, examType]);

  useEffect(() => {
    if (selectionMode === "manual" && selectedQuestions.length > 0) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };

        // remove global error
        delete newErrors.totalQuestions;

        // ✅ remove ALL subject errors
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("subject_")) {
            delete newErrors[key];
          }
        });

        return newErrors;
      });
    }
  }, [selectedQuestions, selectionMode]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const fetchQuestionsByTopic = async (topicId: number) => {
    // already loaded → skip
    if (questionsByTopic[topicId] || loadingTopics[topicId]) return;

    setLoadingTopics((prev) => ({ ...prev, [topicId]: true }));

    try {
      const res = await fetch(`/api/questions/by-topic?topicId=${topicId}`);
      const data = await res.json();

      setQuestionsByTopic((prev) => ({
        ...prev,
        [topicId]: data,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTopics((prev) => ({ ...prev, [topicId]: false }));
    }
  };

  const renderStepContent = () => {
    switch (steps[activeStep]) {
      case "General Info":
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Exam Title"
              value={examTitle}
              onChange={(e) => {
                const value = e.target.value;
                setExamTitle(value);
                validateField("examTitle", value);

                if (value.trim().length >= 3) {
                  checkDuplicateTitle(value);
                }
              }}
              error={!!formErrors.examTitle}
              helperText={formErrors.examTitle}
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => {
                const value = e.target.value;
                setDescription(value);
                validateField("description", value);
              }}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            <Typography fontWeight={600}>Exam Type</Typography>
            <RadioGroup
              row
              value={examType}
              onChange={(e) => {
                const type = e.target.value as ExamType;
                setExamType(type);
                validateField("examType", type);
                setActiveStep(0);

                // reset rules-related fields when switching types
                setStartTime("");
                setEndTime("");
                setDateErrors({});

                if (type === "mock" || type === "live") {
                  setDuration(120);
                }
              }}
            >
              <FormControlLabel
                value="practice"
                control={<Radio />}
                label="Practice"
              />
              <FormControlLabel value="mock" control={<Radio />} label="Mock" />
              <FormControlLabel value="live" control={<Radio />} label="Live" />
            </RadioGroup>
          </Box>
        );

      case "Rules":
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label={
                examType === "practice"
                  ? "Duration (Auto Calculated)"
                  : "Duration (minutes)"
              }
              type="number"
              value={duration}
              onChange={handleDurationChange}
              disabled={
                examType === "mock" ||
                examType === "live" ||
                examType === "practice"
              }
              error={!!formErrors.duration}
              helperText={formErrors.duration}
              inputProps={{
                min: 1,
                max: 300,
              }}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {examType === "live" && (
              <>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartTime(value);

                    if (!value) {
                      setEndTime("");
                      setDateErrors({});
                      return;
                    }

                    let newEnd = "";

                    // Calculate endTime based on duration
                    if (duration) {
                      const start = parseLocalDatetime(value);
                      const end = new Date(
                        start.getTime() + duration * 60 * 1000,
                      );
                      newEnd = toDatetimeLocal(end.toISOString());
                      setEndTime(toDatetimeLocal(end.toISOString()));
                    }

                    validateLiveDates(value, newEnd);
                  }}
                  error={!!dateErrors.startTime}
                  helperText={dateErrors.startTime}
                  inputProps={{
                    min: toDatetimeLocal(new Date().toISOString()),
                    max: "9999-12-31T23:59",
                  }}
                />

                <TextField
                  label="End Time (Auto Calculated)"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={endTime}
                  InputProps={{ readOnly: true }}
                />
              </>
            )}
          </Box>
        );

      case "Questions":
        return (
          <>
            {/* Selection Mode */}
            <Box mb={2} border="1px solid #ddd" borderRadius={2} p={2}>
              <Typography fontWeight={600}>Selection Mode</Typography>

              <RadioGroup
                row
                value={selectionMode}
                onChange={(e) => {
                  const mode = e.target.value as "auto" | "manual";
                  setSelectionMode(mode);

                  // Reset topic selection when switching mode
                  setTopicCounts({});
                  setTopicErrors({});
                  setSelectedQuestions([]);
                  setQuestionsByTopic({});
                  setPageByTopic({});
                  setSearchTerms({});
                  setExpandedTopics({});
                }}
              >
                <FormControlLabel
                  value="auto"
                  control={<Radio />}
                  label="Auto (by count)"
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio />}
                  label="Manual Selection"
                />
              </RadioGroup>
            </Box>

            {formErrors.subject && (
              <Typography color="error" mb={2}>
                {formErrors.subject}
              </Typography>
            )}

            {loadingSubjects ? (
              <Box display="flex" justifyContent="center" mt={3}>
                <CircularProgress />
              </Box>
            ) : (
              subjects.map((subj) => {
                const selected = selectedSubjects.includes(subj.subject_id);
                return (
                  <Box key={subj.subject_id} mb={3}>
                    <FormControlLabel
                      control={
                        isPractice ? (
                          <Radio
                            checked={selected}
                            onChange={() => toggleSubject(subj.subject_id)}
                          />
                        ) : (
                          <Checkbox
                            checked={selected}
                            onChange={() => toggleSubject(subj.subject_id)}
                          />
                        )
                      }
                      label={subj.subject_name}
                    />

                    {/* Subject-level error */}
                    {formErrors[`subject_${subj.subject_id}`] && (
                      <Typography color="error" ml={4} mb={1}>
                        {formErrors[`subject_${subj.subject_id}`]}
                      </Typography>
                    )}

                    {selected &&
                      subj.topics.map((topic: any) => {
                        const disabled = topic.question_count === 0;
                        const searchValue = searchTerms[topic.topic_id] || "";
                        const list = questionsByTopic[topic.topic_id] || [];
                        const filterType =
                          filterByTopic[topic.topic_id] || "all";

                        const filteredQuestions = list
                          .filter((q) =>
                            q.question_text
                              .toLowerCase()
                              .includes(searchValue.toLowerCase()),
                          )
                          .filter((q) => {
                            if (filterType === "selected") {
                              return selectedQuestions.includes(q.question_id);
                            }
                            if (filterType === "unselected") {
                              return !selectedQuestions.includes(q.question_id);
                            }
                            return true;
                          });

                        const selectedCount = (
                          questionsByTopic[topic.topic_id] || []
                        ).filter((q) =>
                          selectedQuestions.includes(q.question_id),
                        ).length;

                        const page = pageByTopic[topic.topic_id] || 0;
                        const rowsPerPage = 10;
                        const paginatedQuestions = filteredQuestions.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        );
                        const totalPages = Math.max(
                          1,
                          Math.ceil(filteredQuestions.length / rowsPerPage),
                        );

                        return (
                          <Box key={topic.topic_id} mb={2} ml={4}>
                            <Box
                              display="grid"
                              gridTemplateColumns={
                                selectionMode === "manual"
                                  ? "200px 120px 300px 300px"
                                  : "200px 120px 120px"
                              }
                              alignItems="center"
                              gap={2}
                              mb={1}
                            >
                              <Typography>{topic.topic_name}</Typography>
                              <Typography
                                color={
                                  disabled ? "text.disabled" : "text.primary"
                                }
                              >
                                Available: {topic.question_count}
                              </Typography>

                              {selectionMode === "manual" ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={topic.question_count === 0}
                                    onClick={() => {
                                      // toggle UI
                                      setExpandedTopics((prev) => ({
                                        ...prev,
                                        [topic.topic_id]: !prev[topic.topic_id],
                                      }));

                                      // fetch only first time
                                      if (!questionsByTopic[topic.topic_id]) {
                                        fetchQuestionsByTopic(topic.topic_id);
                                      }
                                    }}
                                  >
                                    {loadingTopics[topic.topic_id]
                                      ? "Loading..."
                                      : expandedTopics[topic.topic_id] || false
                                        ? "Hide Questions"
                                        : "Show Questions"}
                                  </Button>
                                  {topic.question_count > 0 && (
                                    <Typography>
                                      Selected:{" "}
                                      {
                                        (
                                          questionsByTopic[topic.topic_id] || []
                                        ).filter((q) =>
                                          selectedQuestions.includes(
                                            q.question_id,
                                          ),
                                        ).length
                                      }
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <TextField
                                  size="small"
                                  type="number"
                                  disabled={disabled}
                                  value={topicCounts[topic.topic_id] ?? ""}
                                  error={!!topicErrors[topic.topic_id]}
                                  helperText={
                                    topicErrors[topic.topic_id] || " "
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleTopicChange(
                                      topic.topic_id,
                                      val === "" ? undefined : Number(val),
                                      topic.question_count,
                                    );
                                  }}
                                  inputProps={{
                                    min: 0,
                                    max: topic.question_count,
                                  }}
                                />
                              )}
                            </Box>

                            {/* Manual Mode Table */}
                            {selectionMode === "manual" &&
                              expandedTopics[topic.topic_id] &&
                              questionsByTopic[topic.topic_id] && (
                                <Box mt={1} p={2} component={Paper}>
                                  <Box display="flex" gap={2} mb={1}>
                                    <TextField
                                      select
                                      size="small"
                                      label="Filter"
                                      value={
                                        filterByTopic[topic.topic_id] || "all"
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value as
                                          | "all"
                                          | "selected"
                                          | "unselected";

                                        setFilterByTopic((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: value,
                                        }));

                                        setPageByTopic((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: 0,
                                        }));
                                      }}
                                      SelectProps={{ native: true }}
                                    >
                                      <option value="all">All</option>
                                      <option value="selected">Selected</option>
                                      <option value="unselected">
                                        Unselected
                                      </option>
                                    </TextField>

                                    <TextField
                                      size="small"
                                      fullWidth
                                      placeholder="Search questions..."
                                      value={searchTerms[topic.topic_id] || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        setSearchTerms((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: value,
                                        }));

                                        setPageByTopic((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: 0,
                                        }));
                                      }}
                                      sx={{ flex: 1 }}
                                    />
                                  </Box>

                                  <TableContainer>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow
                                          sx={{ backgroundColor: "#f8f9fa" }}
                                        >
                                          <TableCell
                                            width={50}
                                            sx={{ fontWeight: "bold" }}
                                          >
                                            <Checkbox
                                              checked={
                                                paginatedQuestions.length > 0 &&
                                                paginatedQuestions.every((q) =>
                                                  selectedQuestions.includes(
                                                    q.question_id,
                                                  ),
                                                )
                                              }
                                              indeterminate={
                                                paginatedQuestions.some((q) =>
                                                  selectedQuestions.includes(
                                                    q.question_id,
                                                  ),
                                                ) &&
                                                !paginatedQuestions.every((q) =>
                                                  selectedQuestions.includes(
                                                    q.question_id,
                                                  ),
                                                )
                                              }
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  // SELECT ALL (only current page)
                                                  const ids =
                                                    paginatedQuestions.map(
                                                      (q) => q.question_id,
                                                    );

                                                  setSelectedQuestions(
                                                    (prev) => [
                                                      ...new Set([
                                                        ...prev,
                                                        ...ids,
                                                      ]),
                                                    ],
                                                  );
                                                } else {
                                                  // UNSELECT ALL (only current page)
                                                  setSelectedQuestions((prev) =>
                                                    prev.filter(
                                                      (id) =>
                                                        !paginatedQuestions.some(
                                                          (q) =>
                                                            q.question_id ===
                                                            id,
                                                        ),
                                                    ),
                                                  );
                                                }
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell
                                            sx={{ fontWeight: "bold" }}
                                          >
                                            Question
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {paginatedQuestions.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={2}
                                              align="center"
                                            >
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                py={2}
                                              >
                                                {searchValue
                                                  ? "No questions match your search"
                                                  : filterType === "selected"
                                                    ? "No selected questions"
                                                    : filterType ===
                                                        "unselected"
                                                      ? "No unselected questions"
                                                      : "No questions available"}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          paginatedQuestions.map((q) => (
                                            <TableRow key={q.question_id}>
                                              <TableCell>
                                                <Checkbox
                                                  checked={selectedQuestions.includes(
                                                    q.question_id,
                                                  )}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setSelectedQuestions(
                                                        (prev) => [
                                                          ...prev,
                                                          q.question_id,
                                                        ],
                                                      );
                                                    } else {
                                                      setSelectedQuestions(
                                                        (prev) =>
                                                          prev.filter(
                                                            (id) =>
                                                              id !==
                                                              q.question_id,
                                                          ),
                                                      );
                                                    }
                                                  }}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                {q.question_text}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>

                                  {/* Pagination Controls */}
                                  <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    gap={1}
                                    mt={1}
                                  >
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        setPageByTopic((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: Math.max(
                                            (prev[topic.topic_id] || 0) - 1,
                                            0,
                                          ),
                                        }))
                                      }
                                      disabled={
                                        totalPages <= 1 ||
                                        (pageByTopic[topic.topic_id] || 0) === 0
                                      }
                                    >
                                      Previous
                                    </Button>

                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      Page {(page || 0) + 1} of{" "}
                                      {totalPages || 1}
                                    </Typography>

                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        setPageByTopic((prev) => ({
                                          ...prev,
                                          [topic.topic_id]: Math.min(
                                            (prev[topic.topic_id] || 0) + 1,
                                            totalPages - 1,
                                          ),
                                        }))
                                      }
                                      disabled={
                                        totalPages <= 1 ||
                                        (pageByTopic[topic.topic_id] || 0) >=
                                          totalPages - 1
                                      }
                                    >
                                      Next
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                          </Box>
                        );
                      })}
                  </Box>
                );
              })
            )}
            {/* 
            <Typography fontWeight={700} mt={2}>
              Total Questions: {totalQuestions}
              {selectionMode === "manual" && " (Manual Selection)"}
            </Typography>

            {formErrors.totalQuestions && (
              <Typography color="error">{formErrors.totalQuestions}</Typography>
            )} */}
          </>
        );

      case "Review":
        return (
          <Box>
            <Typography sx={{ mb: 1 }}>
              <b>Title:</b> {examTitle}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Type:</b> {examType}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Duration:</b> {duration} minutes
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Total Questions:</b> {totalQuestions}
            </Typography>
            {examType === "live" && (
              <>
                <Typography>
                  <b>Start Time:</b> {formatReviewDateTime(startTime)}
                </Typography>

                <Typography>
                  <b>End Time:</b> {formatReviewDateTime(endTime)}
                </Typography>
              </>
            )}
          </Box>
        );
    }
  };

  return (
    <>
      <Dialog
        open={open}
        fullScreen
        onClose={(event, reason) => {
          // Prevent closing when clicking outside or pressing Escape
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;

          resetForm();
          onClose();
        }}
        scroll="paper"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          Create New Exam
          <IconButton
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent()}
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            {/* LEFT SIDE */}
            <Button
              variant="outlined"
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
            >
              Back
            </Button>

            {/* 🔥 SHOW ONLY IN QUESTIONS STEP */}
            {steps[activeStep] === "Questions" && (
              <Box display="flex" flexDirection="column" textAlign="left">
                <Typography fontWeight={700}>
                  Total Questions: {totalQuestions}
                  {selectionMode === "manual" && " (Manual Selection)"}
                </Typography>

                {formErrors.totalQuestions && (
                  <Typography color="error">
                    {formErrors.totalQuestions}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* RIGHT SIDE */}
          <Box display="flex" gap={1}>
            {/* ✅ Preview Button */}
            {steps[activeStep] === "Questions" &&
              selectionMode === "manual" &&
              selectedQuestions.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    const allQuestions = Object.values(questionsByTopic).flat();

                    const selected = allQuestions.filter((q) =>
                      selectedQuestions.includes(q.question_id),
                    );

                    setPreviewQuestions(selected);
                    setPreviewOpen(true);
                  }}
                >
                  Preview Selected ({selectedQuestions.length})
                </Button>
              )}

            {/* Next / Create */}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={apiLoading || isSubmitting}
                startIcon={
                  isSubmitting ? (
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
                {isSubmitting ? "Creating..." : "Create Exam"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={apiLoading}
              >
                Next
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview Questions </DialogTitle>

        <DialogContent dividers>
          {previewQuestions.length === 0 ? (
            <Typography>No questions selected</Typography>
          ) : (
            previewQuestions.map((q, index) => (
              <Box key={q.question_id} mb={3}>
                <Typography fontWeight={600}>
                  {index + 1}. {q.question_text}
                </Typography>

                <Box ml={2} mt={1}>
                  <Typography>A. {q.option_a}</Typography>
                  <Typography>B. {q.option_b}</Typography>
                  <Typography>C. {q.option_c}</Typography>
                  <Typography>D. {q.option_d}</Typography>
                </Box>

                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((prev) => ({
              ...prev,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
