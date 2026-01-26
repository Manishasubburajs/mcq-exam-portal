"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";

type ExamType = "practice" | "mock" | "live";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  examData: any; // from GET /api/exams/[id]
}

export default function EditExamModal({
  open,
  onClose,
  onSuccess,
  examData,
}: Props) {
  /* -------------------- STATE -------------------- */
  const [examTitle, setExamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState<ExamType>("practice");
  const [duration, setDuration] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  const canEdit = examData?.canEdit;

  /* -------------------- PREFILL -------------------- */
  useEffect(() => {
    if (!open || !examData) return;

    setExamTitle(examData.exam_name || "");
    setDescription(examData.description || "");
    setExamType(examData.exam_type);
    setDuration(examData.duration_minutes);

    setStartTime(
      examData.scheduled_start
        ? new Date(examData.scheduled_start).toISOString().slice(0, 16)
        : "",
    );

    setEndTime(
      examData.scheduled_end
        ? new Date(examData.scheduled_end).toISOString().slice(0, 16)
        : "",
    );

    const counts: Record<number, number> = {};
    examData.subjects.forEach((s: any) => {
      counts[s.topic_id] = s.question_count;
    });
    setTopicCounts(counts);
  }, [open, examData]);

  /* -------------------- SUBMIT -------------------- */
  const handleUpdate = async () => {
    setSaving(true);

    const payload = {
      examTitle,
      description,
      examType, // backend ignores changes anyway
      duration: examType === "practice" ? null : duration,
      startTime: examType === "live" ? startTime : null,
      endTime: examType === "live" ? endTime : null,
      topicCounts,
    };

    try {
      const res = await fetch(`/api/exams/${examData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update exam");
        return;
      }

      alert("Exam updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating exam");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Exam</DialogTitle>

      <DialogContent>
        {!canEdit && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This exam is already assigned to students and cannot be edited.
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            disabled={!canEdit}
            required
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit}
          />

          <Typography fontWeight={600}>
            Exam Type: {examType.toUpperCase()}
          </Typography>

          {(examType === "mock" || examType === "live") && (
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration ?? ""}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={!canEdit}
            />
          )}

          {examType === "live" && (
            <>
              <TextField
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!canEdit}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!canEdit}
              />
            </>
          )}

          <Divider />

          <Typography fontWeight={600}>Questions</Typography>
          {examData.subjects.map((s: any) => (
            <Box
              key={s.topic_id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>
                {s.subject_name} – {s.topic_name}
              </Typography>
              <TextField
                size="small"
                type="number"
                value={topicCounts[s.topic_id] ?? ""}
                disabled={!canEdit}
                onChange={(e) =>
                  setTopicCounts((prev) => ({
                    ...prev,
                    [s.topic_id]: Number(e.target.value),
                  }))
                }
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={!canEdit || saving}
        >
          {saving ? <CircularProgress size={20} /> : "Update Exam"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
