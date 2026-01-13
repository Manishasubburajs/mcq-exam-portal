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
} from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  examId: number;
}

interface Student {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function AssignExamModal({ open, onClose, examId }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-assigned students
  const [preAssigned, setPreAssigned] = useState<number[]>([]);

  // Current checked state (selected by user)
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && examId) {
      setError("");
      setPreAssigned([]);
      setChecked(new Set());
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
        setPreAssigned(json.data);
        setChecked(new Set(json.data)); // check initially assigned
      }
    } catch {
      // silent fail
    }
  };

  const toggleStudent = (studentId: number) => {
    setChecked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) newSet.delete(studentId);
      else newSet.add(studentId);
      return newSet;
    });
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setChecked(new Set(students.map(s => s.user_id)));
    } else {
      setChecked(new Set());
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
          assignedBy: 1, // TODO: Replace with logged-in admin
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert("✅ Exam assignments updated successfully");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to assign exam");
    }
  };

  const isChanged = () => {
    const current = Array.from(checked).sort();
    const previous = [...preAssigned].sort();
    return JSON.stringify(current) !== JSON.stringify(previous);
  };

  const getButtonText = () => {
    if (preAssigned.length === 0) return "Assign Exam"; // no assignment yet
    if (checked.size === 0 && preAssigned.length > 0) return "Update"; // unassign all
    if (isChanged()) return "Update Assignment"; // changes made
    return "Assign Exam"; // fallback
  };

  const isButtonDisabled = () => {
    if (preAssigned.length === 0 && checked.size === 0) return true; // nothing selected yet
    if (checked.size === 0 && preAssigned.length > 0) return false; // can unassign all
    return isChanged() ? false : true; // enable only if changes made
  };

  const selectedCount = checked.size;
  const allSelected = students.length > 0 && checked.size === students.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Exam to Students</DialogTitle>

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
          label="Number of Students Selected"
          value={selectedCount}
          fullWidth
          margin="dense"
          disabled
        />

        {loading ? (
          <CircularProgress />
        ) : (
          <List dense>
            {students.map((s) => (
              <ListItem key={s.user_id} disablePadding>
                <ListItemButton onClick={() => toggleStudent(s.user_id)}>
                  <ListItemIcon>
                    <Checkbox checked={checked.has(s.user_id)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${s.first_name} ${s.last_name}`}
                    secondary={s.email}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
