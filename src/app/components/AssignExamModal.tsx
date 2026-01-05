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
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------
  // Fetch students when modal opens
  // -------------------------------
  useEffect(() => {
    if (open) {
      setSelected([]);
      setError("");
      fetchStudents();
    }
  }, [open]);

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

  // -------------------------------
  // Toggle individual student
  // -------------------------------
  const toggleStudent = (id: number) => {
    setError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // -------------------------------
  // Select / Deselect all
  // -------------------------------
  const handleSelectAll = (checked: boolean) => {
    setError("");
    setSelected(checked ? students.map((s) => s.user_id) : []);
  };

  // -------------------------------
  // Assign exam
  // -------------------------------
  const handleAssign = async () => {
    if (selected.length === 0) {
      setError("Please select at least one student");
      return;
    }

    try {
      const res = await fetch("/api/exams/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentIds: selected,
          assignedBy: 1, // TODO: replace with logged-in admin
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      alert("✅ Exam assigned successfully");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to assign exam");
    }
  };

  const allSelected =
    students.length > 0 && selected.length === students.length;

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
          value={selected.length}
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
                    <Checkbox checked={selected.includes(s.user_id)} />
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
          disabled={selected.length === 0}
        >
          Assign Exam
        </Button>
      </DialogActions>
    </Dialog>
  );
}
