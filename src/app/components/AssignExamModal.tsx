"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  examId: number;
  onSuccess?: (examId: number, assignedCount: number) => void;
}

interface Student {
  user_id: number;
  username: string;
  email: string;
}

export default function AssignExamModal({
  open,
  onClose,
  examId,
  onSuccess,
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [preAssigned, setPreAssigned] = useState<number[]>([]);
  const [completedStudents, setCompletedStudents] = useState<Set<number>>(
    new Set(),
  );
  const [checked, setChecked] = useState<Set<number>>(new Set());

  // ✅ NEW: shuffle toggle
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // ✅ Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  useEffect(() => {
    if (open && examId) {
      setError("");
      setPreAssigned([]);
      setChecked(new Set());
      setShuffleQuestions(false);
      fetchStudents();
      fetchAssignedStudents();
    }
  }, [open, examId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (!json.success) throw new Error();
      setStudents(json.data);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      const res = await fetch(`/api/exams/${examId}/assigned-students`);
      const json = await res.json();
      if (json.success) {
        const assignedIds = json.data.map((s: any) => s.student_id);
        const lockedIds = json.data
          .filter((s: any) => s.isLocked)
          .map((s: any) => s.student_id);

        setPreAssigned(assignedIds);
        setChecked(new Set(assignedIds));
        setCompletedStudents(new Set(lockedIds));
      }
    } catch {}
  };

  const toggleStudent = (studentId: number) => {
    if (completedStudents.has(studentId)) return;

    setChecked((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      // Select all students that are not locked
      const selectable = students
        .map((s) => s.user_id)
        .filter((id) => !completedStudents.has(id));

      // Merge with already locked students
      const newChecked = new Set([
        ...selectable,
        ...Array.from(completedStudents),
      ]);
      setChecked(newChecked);
    } else {
      // Uncheck only students that are not locked
      const stillChecked = Array.from(completedStudents); // keep locked students checked
      setChecked(new Set(stillChecked));
    }
  };

  const handleAssign = async () => {
    try {
      const res = await fetch("/api/exams/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentIds: Array.from(checked),
          shuffleEnabled: shuffleQuestions, // ✅ send flag
          assignedBy: 1,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSnackbarMessage("Exam assignment updated");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      if (onSuccess) {
        onSuccess(examId, checked.size);
      }

      onClose();
    } catch (err: any) {
      setSnackbarMessage(err.message || "Failed to assign exam");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const isChanged = () => {
    return (
      JSON.stringify([...checked].sort()) !==
      JSON.stringify([...preAssigned].sort())
    );
  };

  const isButtonDisabled = () => {
    if (preAssigned.length === 0 && checked.size === 0) return true;
    return !isChanged();
  };

  const allSelected =
    students
      .filter((s) => !completedStudents.has(s.user_id))
      .every((s) => checked.has(s.user_id)) &&
    Array.from(completedStudents).every((id) => checked.has(id));

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          // Prevent closing when clicking outside or pressing Escape
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          onClose();
        }}
        maxWidth="sm"
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
          Assign Exam to Students
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All Students"
          />

          <TextField
            label="Students Selected"
            value={checked.size}
            fullWidth
            margin="dense"
            disabled
          />

          {/* ✅ Shuffle option */}
          <FormControlLabel
            control={
              <Checkbox
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
              />
            }
            label="Shuffle questions for each student"
          />

          {loading ? (
            <CircularProgress />
          ) : (
            <List dense>
              {students.map((s) => (
                <ListItem key={s.user_id} disablePadding>
                  <ListItemButton onClick={() => toggleStudent(s.user_id)}>
                    <ListItemIcon>
                      <Tooltip
                        title={
                          completedStudents.has(s.user_id)
                            ? "Cannot unassign: student started or completed the exam"
                            : ""
                        }
                        arrow
                      >
                        <span>
                          <Checkbox
                            checked={checked.has(s.user_id)}
                            disabled={completedStudents.has(s.user_id)}
                          />
                        </span>
                      </Tooltip>
                    </ListItemIcon>
                    <ListItemText primary={s.username} secondary={s.email} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={isButtonDisabled()}
          >
            {checked.size > preAssigned.length
              ? "Assign Exam"
              : "Update Assignment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          variant="filled"
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
