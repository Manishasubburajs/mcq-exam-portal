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
  Select,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import * as Yup from "yup";

type ExamType = "practice" | "mock" | "live";
type QuestionMode = "same" | "shuffle" | "random";

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

interface Subject {
  subject_id: number;
  subject_name: string;
  topics: Topic[];
}

interface Topic {
  topic_id: number;
  topic_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateExamModal({ open, onClose, onSuccess }: Props) {
  const resetForm = () => {
    setActiveStep(0);
    setExamTitle("");
    setDescription("");
    setExamType("practice");
    setDuration(60);
    setQuestionMode("random");
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
  const [questionMode, setQuestionMode] = useState<QuestionMode>("random");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // STEP 3: Questions
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});
  const [topicErrors, setTopicErrors] = useState<Record<number, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const steps = useMemo(() => {
    return examType === "practice"
      ? ["General Info", "Questions", "Review"]
      : ["General Info", "Rules", "Questions", "Review"];
  }, [examType]);

  const isPractice = examType === "practice";

  const totalQuestions = Object.values(topicCounts).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
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


  // Toggle Subject
  const toggleSubject = (id: number) => {
    if (isPractice) {
      setSelectedSubjects([id]);
      setTopicCounts({});
      setTopicErrors({});
    } else {
      setSelectedSubjects((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    }
  };

  // Handle topic input change
  const handleTopicChange = (topicId: number, value: number, max: number) => {
    let error = "";
    if (value < 1) error = "Must be at least 1";
    else if (value > max) error = `Max available ${max}`;
    setTopicErrors((prev) => ({ ...prev, [topicId]: error }));
    setTopicCounts((prev) => ({ ...prev, [topicId]: value }));
  };

  // Yup validation schema
  const getValidationSchema = () =>
    Yup.object({
      examTitle: Yup.string().required("Exam title is required"),
      description: Yup.string(),
      topicCounts: Yup.object(
        selectedSubjects.reduce((acc, subjectId) => {
          const subj = subjects.find((s) => s.subject_id === subjectId);
          subj?.topics.forEach((topic) => {
            if (topic.question_count > 0) {
              acc[topic.topic_id] = Yup.number()
                .required("Required")
                .min(1, "Must be at least 1")
                .max(topic.question_count, `Cannot exceed ${topic.question_count}`);
            }
          });
          return acc;
        }, {} as Record<number, Yup.NumberSchema>)
      ),
    });

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      const schema = getValidationSchema();
      try {
        await schema.validate(
          { examTitle, description, topicCounts },
          { abortEarly: false }
        );
        setTopicErrors({});
        setFormErrors({});
        setActiveStep((s) => s + 1);
      } catch (err: any) {
        const topicErrors: Record<number, string> = {};
        const formErrors: Record<string, string> = {};
        err.inner?.forEach((e: any) => {
          if (e.path === "examTitle") formErrors.examTitle = e.message;
          else if (e.path === "description") formErrors.description = e.message;
          else if (e.path.startsWith("topicCounts.")) {
            const topicId = Number(e.path.replace("topicCounts.", ""));
            topicErrors[topicId] = e.message;
          }
        });
        setTopicErrors(topicErrors);
        setFormErrors(formErrors);
      }
    }
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async () => {
    const payload = {
      examTitle,
      description,
      examType,
      duration,
      questionMode,
      startTime,
      endTime,
      topicCounts,
    };

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Exam created successfully!");
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        alert(data.message || "Failed to create exam");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating exam");
    }
  };

  const renderStepContent = () => {

    switch (steps[activeStep]) {
      case "General Info":
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Exam Title"
              required
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              error={!!formErrors.examTitle}
              helperText={formErrors.examTitle}
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                setActiveStep(0);
                if (type === "practice") setQuestionMode("random");
                if (type === "live") setQuestionMode("same");
              }}
            >
              <FormControlLabel value="practice" control={<Radio />} label="Practice" />
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
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            {examType === "mock" && (
              <>
                <Typography fontWeight={600}>Question Pattern</Typography>
                <Select
                  value={questionMode}
                  onChange={(e) => setQuestionMode(e.target.value as QuestionMode)}
                >
                  <MenuItem value="same">Same</MenuItem>
                  <MenuItem value="shuffle">Shuffle</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </Select>
              </>
            )}
            {examType === "live" && (
              <>
                <Typography fontWeight={600}>Question Pattern: SAME (Locked)</Typography>
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <TextField
                  label="End Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </>
            )}
          </Box>
        );

      case "Questions":
        return (
          <Box>
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
                              <Typography color={disabled ? "text.disabled" : "text.primary"}>
                                Available: {topic.question_count}
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                disabled={disabled}
                                value={topicCounts[topic.topic_id] ?? ""}
                                error={!!topicErrors[topic.topic_id]}
                                helperText={topicErrors[topic.topic_id] || " "}
                                onChange={(e) =>
                                  handleTopicChange(
                                    topic.topic_id,
                                    Number(e.target.value),
                                    topic.question_count
                                  )
                                }
                                inputProps={{ min: 0, max: topic.question_count }}
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
            <Typography><b>Title:</b> {examTitle}</Typography>
            <Typography><b>Type:</b> {examType}</Typography>
            <Typography><b>Pattern:</b> {questionMode}</Typography>
            <Typography><b>Total Questions:</b> {totalQuestions}</Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onClose(); }} maxWidth="md" fullWidth>
      <DialogTitle>Create New Exam</DialogTitle>
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
          {activeStep === steps.length - 1 ? "Create Exam" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
