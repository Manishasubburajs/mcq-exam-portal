"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Alert,
} from '@mui/material';

interface Exam {
  id: number;
  exam_name: string;
  subject_name: string;
  topic_name: string;
  subject_id: number;
  topic_id: number;
  exam_type: 'practice' | 'mock' | 'live';
  status: 'active' | 'draft' | 'completed' | 'inactive';
  questions_count: number;
  duration_minutes: number;
  created_at: string;
  total_participants: number;
}

interface EditExamModalProps {
  open: boolean;
  onClose: () => void;
  exam: Exam | null;
  subjects: any[];
  onSuccess: () => void;
}

const EditExamModal: React.FC<EditExamModalProps> = ({
  open,
  onClose,
  exam,
  subjects,
  onSuccess,
}) => {
  const [examName, setExamName] = useState('');
  const [subjectId, setSubjectId] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (exam) {
      setExamName(exam.exam_name);
      setSubjectId(exam.subject_id);
      setDuration(exam.duration_minutes);
    }
  }, [exam]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!examName.trim() || !subjectId || duration <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/exams/${exam?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_name: examName,
          subject_id: subjectId,
          duration_minutes: duration,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to update exam');
      }
    } catch (err) {
      console.error('Error updating exam:', err);
      setError('An error occurred while updating the exam');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Exam</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Exam Name"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subjectId}
                  onChange={(e) => setSubjectId(Number(e.target.value))}
                  label="Subject"
                  required
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExamModal;