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
}

export default function CreateExamModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  /* -------------------- RESET -------------------- */
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

  /* STEP 1 */
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState<ExamType>("practice");

  /* STEP 2 */
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  /* STEP 3 */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});
  const [topicErrors, setTopicErrors] = useState<Record<number, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const isPractice = examType === "practice";

  const steps = useMemo(
    () =>
      examType === "practice"
        ? ["General Info", "Questions", "Review"]
        : ["General Info", "Rules", "Questions", "Review"],
    [examType],
  );

  const totalQuestions = Object.values(topicCounts).reduce(
    (sum, v) => sum + Number(v || 0),
    0,
  );

  /* -------------------- FETCH SUBJECTS -------------------- */
  useEffect(() => {
    if (!open) return;

    setLoadingSubjects(true);
    fetch("/api/questions/question-counts")
      .then((res) => res.json())
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, [open]);

  /* -------------------- SUBJECT TOGGLE -------------------- */
  const toggleSubject = (id: number) => {
    if (isPractice) {
      setSelectedSubjects([id]);
      setTopicCounts({});
      setTopicErrors({});
    } else {
      setSelectedSubjects((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
      );
    }
  };

  /* -------------------- TOPIC COUNT -------------------- */
  const handleTopicChange = (topicId: number, value: number, max: number) => {
    let error = "";
    if (value < 1) error = "Must be at least 1";
    else if (value > max) error = `Max available ${max}`;

    setTopicErrors((prev) => ({ ...prev, [topicId]: error }));
    setTopicCounts((prev) => ({ ...prev, [topicId]: value }));
  };

  /* -------------------- VALIDATION -------------------- */
  const getValidationSchema = () =>
    Yup.object({
      examTitle: Yup.string().required("Exam title is required"),
      topicCounts: Yup.object().required(),
    });

  /* -------------------- STEPS -------------------- */
  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
      return;
    }

    try {
      await getValidationSchema().validate(
        { examTitle, topicCounts },
        { abortEarly: false },
      );
      setFormErrors({});
      setActiveStep((s) => s + 1);
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.inner?.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      setFormErrors(errors);
    }
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    const payload = {
      examTitle,
      description,
      examType,
      duration: examType === "practice" ? null : duration,
      startTime: examType === "live" ? startTime : null,
      endTime: examType === "live" ? endTime : null,
      topicCounts,
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Exam created successfully");
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create exam");
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Create New Exam</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP CONTENT — unchanged logic */}
        {/* You can keep your existing renderStepContent here if you want */}
      </DialogContent>

      <DialogActions>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Create Exam" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
