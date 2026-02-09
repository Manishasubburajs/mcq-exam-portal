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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
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
  examData: any;
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

const rulesSchema = Yup.object({
  duration: Yup.number()
    .typeError("Duration must be a number")
    .required("Duration is required")
    .min(1, "Duration must be at least 1 minute")
    .max(300, "Duration cannot exceed 300 minutes"),

  startTime: Yup.string().when("examType", {
    is: "live",
    then: (schema) =>
      schema
        .required("Start date is required")
        .test("not-past", "Start date must be today or later", (value) => {
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(value) >= today;
        }),
    otherwise: (schema) => schema.nullable(),
  }),

  endTime: Yup.string().when("examType", {
    is: "live",
    then: (schema) =>
      schema
        .required("End date is required")
        .test(
          "after-start",
          "End date must be on or after start date",
          function (value) {
            const { startTime } = this.parent;
            if (!value || !startTime) return false;
            return new Date(value) >= new Date(startTime);
          },
        ),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default function EditExamModal({
  open,
  onClose,
  onSuccess,
  examData,
}: Props) {
  // const isEdit = true;
  const isEdit = !!examData;

  const resetForm = () => {
    setActiveStep(0);
    setExamTitle("");
    setDescription("");
    setExamType("practice");
    setDuration(60);

    setStartTime("");
    setEndTime("");
    setSelectedSubjects([]);
    setTopicCounts({});
    setTopicErrors({});
    setFormErrors({});
  };

  const [activeStep, setActiveStep] = useState(0);

  // STEP 1: General Info
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState<ExamType>("practice");

  // STEP 2: Rules
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // STEP 3: Questions
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});
  const [topicErrors, setTopicErrors] = useState<Record<number, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [existingExams, setExistingExams] = useState<any[]>([]);
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
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

  const steps = useMemo(() => {
    return examType === "practice"
      ? ["General Info", "Questions", "Review"]
      : ["General Info", "Rules", "Questions", "Review"];
  }, [examType]);

  const isPractice = examType === "practice";

  const totalQuestions = Object.values(topicCounts).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0,
  );

  // Fetch subjects + topics + counts when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingSubjects(true);
    fetch("/api/questions/question-counts")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSubjects(false));
  }, [open]);

  // Populate form for edit
  useEffect(() => {
    if (open && isEdit && examData) {
      setExamTitle(examData.exam_name || "");
      setDescription(examData.description || "");
      setExamType(examData.exam_type);
      setDuration(examData.duration_minutes);
      setStartTime(
        examData.scheduled_start ? examData.scheduled_start.slice(0, 10) : "",
      );

      setEndTime(
        examData.scheduled_end ? examData.scheduled_end.slice(0, 10) : "",
      );

      // For subjects and topics, need to set selectedSubjects and topicCounts from examData.subjects
      const selected = examData.subjects.map((s: any) => s.subject_id);
      setSelectedSubjects(selected);
      const counts: Record<number, number> = {};
      examData.subjects.forEach((s: any) => {
        counts[s.topic_id] = s.question_count;
      });
      setTopicCounts(counts);
    }
  }, [open, isEdit, examData]);

  // Toggle Subject
  const toggleSubject = (id: number) => {
    if (isPractice) {
      setSelectedSubjects([id]);
      setTopicCounts({});
      setTopicErrors({});
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

  // Handle topic input change
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

  const validateGeneralInfoStep = async () => {
    try {
      await generalInfoSchema.validate(
        { examTitle, description, examType },
        { abortEarly: false },
      );

      const normalized = examTitle.trim().toLowerCase();

      const exists = existingExams.some(
        (exam) =>
          exam.id !== examData?.id && // 👈 ADD THIS
          exam.exam_name.trim().toLowerCase() === normalized,
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

      const hasTopic = subject.topics.some(
        (topic) => (topicCounts[topic.topic_id] || 0) > 0,
      );

      if (!hasTopic) {
        errors[`subject_${subjectId}`] =
          "At least one topic must be assigned in this subject";
        isValid = false;
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

    // 🚨 total questions validation
    if (totalQuestions <= 0) {
      errors.totalQuestions = "Please add at least one question";
      isValid = false;
    }

    setFormErrors(errors);

    return isValid;
  };

  const parseLocalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const validateLiveDates = (start = startTime, end = endTime) => {
    if (examType !== "live") return true;

    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!start) {
      errors.startTime = "Start date is required";
    } else {
      const startDate = parseLocalDate(start);

      if (startDate < today) {
        errors.startTime = "Start date must be today or later";
      }
    }

    if (!end) {
      errors.endTime = "End date is required";
    } else if (start) {
      const startDate = parseLocalDate(start);
      const endDate = parseLocalDate(end);

      if (endDate < startDate) {
        errors.endTime = "End date must be on or after start date";
      }
    }

    setDateErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // allow empty for typing
    if (rawValue === "") {
      setDuration(undefined as any);
      setFormErrors((prev) => ({
        ...prev,
        duration: "Duration is required",
      }));
      return;
    }

    const value = Number(rawValue);

    // hard guard
    if (value < 1) {
      setFormErrors((prev) => ({
        ...prev,
        duration: "Duration must be at least 1 minute",
      }));
      setDuration(value);
      return;
    }

    setDuration(value);

    // Yup validation
    rulesSchema
      .validateAt("duration", { duration: value, examType })
      .then(() => setFormErrors((prev) => ({ ...prev, duration: "" })))
      .catch((err) =>
        setFormErrors((prev) => ({ ...prev, duration: err.message })),
      );
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
    const payload = {
      examTitle,
      description,
      examType,
      duration,

      startTime,
      endTime,
      topicCounts,
    };

    try {
      const url = isEdit ? `/api/exams/${examData.id}` : "/api/exams";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showSnackbar(
          `Exam ${isEdit ? "updated" : "created"} successfully!`,
          "success",
        );
          resetForm();
          onSuccess?.();
           onClose();
      } else {
        showSnackbar(
          data.message || `Failed to ${isEdit ? "update" : "create"} exam`,
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showSnackbar(`Error ${isEdit ? "updating" : "creating"} exam`, "error");
    }
  };

  useEffect(() => {
    if (!open) return;

    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        setExistingExams(data || []);
      })
      .catch((err) => console.error(err));
  }, [open]);

  const renderStepContent = () => {
    switch (steps[activeStep]) {
      case "General Info":
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Exam Title"
              required
              value={examTitle}
              onChange={(e) => {
                const value = e.target.value;
                setExamTitle(value);
                validateField("examTitle", value);
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
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={handleDurationChange}
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
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartTime(value);
                    validateLiveDates(value, endTime);
                  }}
                  error={!!dateErrors.startTime}
                  helperText={dateErrors.startTime}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndTime(value);
                    validateLiveDates(startTime, value);
                  }}
                  error={!!dateErrors.endTime}
                  helperText={dateErrors.endTime}
                />
              </>
            )}
          </Box>
        );

      case "Questions":
        return (
          <Box>
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

                    {/* Subject-level error displayed ABOVE topics */}
                    {formErrors[`subject_${subj.subject_id}`] && (
                      <Typography color="error" ml={4} mb={1}>
                        {formErrors[`subject_${subj.subject_id}`]}
                      </Typography>
                    )}

                    {selected && (
                      <Box ml={4} mt={1}>
                        {subj.topics.map((topic) => {
                          const disabled = topic.question_count === 0;
                          return (
                            <Box
                              key={topic.topic_id}
                              display="grid"
                              gridTemplateColumns="200px 120px 120px"
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
                              <TextField
                                size="small"
                                type="number"
                                disabled={disabled}
                                value={topicCounts[topic.topic_id] ?? ""}
                                error={!!topicErrors[topic.topic_id]}
                                helperText={topicErrors[topic.topic_id] || " "}
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
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })
            )}
            <Typography fontWeight={700} mt={2}>
              Total Questions: {totalQuestions}
            </Typography>
          </Box>
        );

      case "Review":
        return (
          <Box>
            <Typography>
              <b>Title:</b> {examTitle}
            </Typography>
            <Typography>
              <b>Type:</b> {examType}
            </Typography>
            <Typography>
              <b>Duration:</b> {duration} minutes
            </Typography>
            <Typography>
              <b>Total Questions:</b> {totalQuestions}
            </Typography>
            {examType === "live" && (
              <>
                <Typography>
                  <b>Start Date:</b>{" "}
                  {startTime
                    ? new Date(startTime).toLocaleDateString()
                    : "Not set"}
                </Typography>
                <Typography>
                  <b>End Date:</b>{" "}
                  {endTime ? new Date(endTime).toLocaleDateString() : "Not set"}
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
        onClose={() => {
          resetForm();
          onClose();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{isEdit ? "Edit Exam" : "Create New Exam"}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent()}
        </DialogContent>
        <DialogActions>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1
              ? isEdit
                ? "Update Exam"
                : "Create Exam"
              : "Next"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
