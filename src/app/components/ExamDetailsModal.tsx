"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Timer,
  CalendarToday,
  Assessment,
  PlayArrow,
  LiveTv,
  Subject as SubjectIcon,
  Topic,
} from "@mui/icons-material";

interface ExamDetails {
  id: number;
  exam_name: string;
  exam_type: "practice" | "mock" | "live";
  status: "active" | "inactive";
  questions_count: number;
  duration_minutes: number | null;
  created_at: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  description: string | null;
  canEdit: boolean;
  canDelete: boolean;
  subjects: {
    subject_id: number;
    subject_name: string;
    topic_id: number;
    topic_name: string | null;
    question_count: number;
  }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  exam: ExamDetails | null;
}

export default function ExamDetailsModal({ open, onClose, exam }: Props) {
  if (!exam) return null;

  const getExamTypeIcon = (type: string) => {
    switch (type) {
      case "practice":
        return <PlayArrow />;
      case "mock":
        return <Assessment />;
      case "live":
        return <LiveTv />;
      default:
        return <Assessment />;
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "practice":
        return "primary";
      case "mock":
        return "secondary";
      case "live":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "success" : "error";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {getExamTypeIcon(exam.exam_type)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {exam.exam_name}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip
                label={
                  exam.status.charAt(0).toUpperCase() + exam.status.slice(1)
                }
                color={getStatusColor(exam.status)}
                size="small"
              />
              <Chip
                label={
                  exam.exam_type.charAt(0).toUpperCase() +
                  exam.exam_type.slice(1)
                }
                color={getExamTypeColor(exam.exam_type)}
                size="small"
                icon={getExamTypeIcon(exam.exam_type)}
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            General Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "inline",
                }}
              >
                Duration:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 600 }}>
                {exam.duration_minutes
                  ? `${exam.duration_minutes} minutes`
                  : "No time limit"}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "inline",
                }}
              >
                Total Questions:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 600 }}>
                {exam.questions_count}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "inline",
                }}
              >
                Created At:
              </Typography>
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 600 }}>
                {new Date(exam.created_at).toLocaleDateString()} at{" "}
                {new Date(exam.created_at).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {exam.description && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Description
              </Typography>
              <Typography variant="body1">{exam.description}</Typography>
            </Box>
          </>
        )}

        {(exam.scheduled_start || exam.scheduled_end) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Schedule
              </Typography>
              <Grid container spacing={2}>
                {exam.scheduled_start && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Start Time
                        </Typography>
                        <Typography variant="body1">
                          {new Date(exam.scheduled_start).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(exam.scheduled_start).toLocaleTimeString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {exam.scheduled_end && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          End Time
                        </Typography>
                        <Typography variant="body1">
                          {new Date(exam.scheduled_end).toLocaleDateString()} at{" "}
                          {new Date(exam.scheduled_end).toLocaleTimeString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Subjects & Topics
          </Typography>
          <List>
            {exam.subjects.map((subject, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <SubjectIcon color="action" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {subject.subject_name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Topic color="action" fontSize="small" />
                      <Typography variant="body2">
                        {subject.topic_name || "N/A"} - {subject.question_count}{" "}
                        questions
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
