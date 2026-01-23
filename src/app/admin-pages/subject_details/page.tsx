"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import dynamic from "next/dynamic";
import * as yup from "yup";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });
import Sidebar from "../../components/Sidebar";

interface Topic {
  topic_id: number;
  topic_name: string;
  questionCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  topic_count: number;
  canEdit: boolean;
  canDelete: boolean;
  topics: Topic[];
  created_at: string;
}

interface CreateSubjectForm {
  subject_name: string;
  topics: string[];
}

interface EditTopic {
  topic_id?: number; // undefined = new topic
  topic_name: string;
  questionCount?: number; // UI only
}

interface EditSubjectForm {
  subject_name: string;
  topics: EditTopic[];
}

const createSubjectSchema = yup.object({
  subject_name: yup.string().required("Subject name is required"),
  topics: yup
    .array()
    .of(yup.string().trim())
    .test(
      "at-least-one-topic",
      "Enter at least one topic",
      (topics) =>
        Array.isArray(topics) &&
        topics.some((topic) => topic && topic.trim() !== ""),
    ),
});

const SubjectDetails: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSubjectForm>({
    subject_name: "",
    topics: [""],
  });
  const [errors, setErrors] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editFormData, setEditFormData] = useState<EditSubjectForm>({
    subject_name: "",
    topics: [],
  });

  const subjectHasLockedTopics = editFormData.topics.some(
    (t) => (t.questionCount ?? 0) > 0,
  );

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      subject_name: "",
      topics: [""],
    });
    setErrors({});
  };

  // Handle form changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add new topic field
  const addTopic = () => {
    setFormData((prev) => ({
      ...prev,
      topics: [...prev.topics, ""],
    }));
  };

  // Remove topic field
  const removeTopic = (index: number) => {
    if (formData.topics.length > 1) {
      setFormData((prev) => ({
        ...prev,
        topics: prev.topics.filter((_, i) => i !== index),
      }));
    }
  };

  // Update topic value
  const updateTopic = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic, i) => (i === index ? value : topic)),
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setCreating(true);

      // Validate form
      await createSubjectSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Subject created successfully!");
        setCreateModalOpen(false);
        resetForm();
        fetchSubjects(); // Refresh the list
      } else {
        if (data.errors) {
          const newErrors: any = {};
          data.errors.forEach((error: string) => {
            if (error.includes("subject_name")) newErrors.subject_name = error;
            if (error.includes("topics")) newErrors.topics = error;
          });
          setErrors(newErrors);
        } else {
          alert(`❌ Error: ${data.message || "Failed to create subject"}`);
        }
      }
    } catch (err: any) {
      // Handle validation errors
      const newErrors: any = {};
      if (err.inner) {
        err.inner.forEach((e: any) => {
          if (e.path === "subject_name") newErrors.subject_name = e.message;
          if (e.path === "topics") newErrors.topics = e.message;
        });
      }
      setErrors(newErrors);
    } finally {
      setCreating(false);
    }
  };

  // Handle edit subject
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject); // keep only for subject_id

    setEditFormData({
      subject_name: subject.subject_name,
      topics: subject.topics.map((t) => ({
        topic_id: t.topic_id,
        topic_name: t.topic_name,
        questionCount: t.questionCount,
      })),
    });

    setEditModalOpen(true);
  };

  // Handle update subject
  const handleUpdate = async () => {
    if (!selectedSubject) return;

    try {
      setCreating(true);

      const payload = {
        subject_name: editFormData.subject_name,
        topics: editFormData.topics
          .filter((t) => t.topic_name.trim() !== "")
          .map((t) => ({
            topic_id: t.topic_id,
            topic_name: t.topic_name,
          })),
      };

      console.log("PUT payload:", payload);

      const res = await fetch(
        `/api/subjects?id=${selectedSubject.subject_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      console.log("PUT response:", data);

      if (data.success) {
        alert("✅ Subject updated successfully!");
        setEditModalOpen(false);
        setSelectedSubject(null);
        setErrors({});
        fetchSubjects();
      } else {
        alert(data.message || "Failed to update subject");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Handle delete subject
  const handleDelete = async (subjectId: number, subjectName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${subjectName}"? This will also delete all its topics.`,
      )
    ) {
      try {
        const res = await fetch(`/api/subjects?id=${subjectId}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (data.success) {
          alert("✅ Subject deleted successfully!");
          fetchSubjects(); // Refresh the list
        } else {
          alert(`❌ Error: ${data.message || "Failed to delete subject"}`);
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("❌ Network error or server unavailable");
      }
    }
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}
    >
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && !isDesktop && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        sx={{
          ml: sidebarOpen && isDesktop ? "220px" : 0,
          transition: "margin-left 0.3s ease",
          paddingTop: { xs: "50px", md: "80px" },
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Manage Subject / Topic"
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <Box sx={{ p: 3 }}>
          {/* Page Header */}
          {/* Subjects Table */}
          <Paper
            elevation={1}
            sx={{ borderRadius: "10px", overflow: "hidden" }}
          >
            <Box
              sx={{
                padding: "20px",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  List of Subjects
                </Typography>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => setCreateModalOpen(true)}
                  sx={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  Create Subject / Topic
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Subject Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Topics Count
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {subjects.map((subject, index) => (
                      <TableRow key={subject.subject_id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>
                            {subject.subject_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${subject.topic_count} topics`}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit Subject" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEdit(subject)}
                                >
                                  <Edit />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={
                                subject.canDelete
                                  ? "Delete Subject"
                                  : "Cannot delete: questions already added"
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={!subject.canDelete}
                                  onClick={() =>
                                    handleDelete(
                                      subject.subject_id,
                                      subject.subject_name,
                                    )
                                  }
                                >
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && subjects.length === 0 && (
              <Box sx={{ textAlign: "center", p: 5, color: "text.secondary" }}>
                <Typography>
                  No subjects found. Create your first subject to get started.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Create Subject Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Create Subject / Topic
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {/* Subject Name */}
            <TextField
              fullWidth
              label="Subject Name"
              value={formData.subject_name}
              onChange={(e) =>
                handleInputChange("subject_name", e.target.value)
              }
              error={!!errors.subject_name}
              helperText={errors.subject_name}
              placeholder="e.g., Mathematics, Science, History"
            />

            {/* Topics */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Topic(s):
              </Typography>

              {formData.topics.map((topic, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Topic ${index + 1}`}
                    value={topic}
                    onChange={(e) => updateTopic(index, e.target.value)}
                    placeholder="Enter topic name"
                  />
                  {formData.topics.length > 1 && (
                    <IconButton
                      onClick={() => removeTopic(index)}
                      color="error"
                      size="small"
                      title="Remove Topic"
                    >
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}

              {errors.topics && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {errors.topics}
                </Typography>
              )}

              <Button
                startIcon={<Add />}
                onClick={addTopic}
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
              >
                Add Topic
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creating}
            sx={{
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {creating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Modal */}
      {/* Edit Subject Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Subject / Topic</DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {/* Subject Name */}
            <TextField
              fullWidth
              label="Subject Name"
              value={editFormData.subject_name}
              disabled={subjectHasLockedTopics}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  subject_name: e.target.value,
                }))
              }
              helperText={
                subjectHasLockedTopics
                  ? "Subject name cannot be changed because questions exist"
                  : errors.subject_name
              }
              error={!subjectHasLockedTopics && !!errors.subject_name}
            />

            {/* Topics */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Topic(s):
              </Typography>

              {editFormData.topics.map((topic, index) => {
                const isLocked = (topic.questionCount ?? 0) > 0;

                return (
                  <Box
                    key={topic.topic_id ?? index}
                    sx={{ display: "flex", gap: 1, mb: 1 }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label={`Topic ${index + 1}`}
                      value={topic.topic_name}
                      disabled={isLocked}
                      onChange={(e) => {
                        if (isLocked) return;

                        setEditFormData((prev) => ({
                          ...prev,
                          topics: prev.topics.map((t, i) =>
                            i === index
                              ? { ...t, topic_name: e.target.value }
                              : t,
                          ),
                        }));
                      }}
                      helperText={
                        isLocked
                          ? "Cannot edit topic: questions exist"
                          : undefined
                      }
                    />

                    {!isLocked && (
                      <IconButton
                        color="error"
                        size="small"
                        title="Remove Topic"
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            topics: prev.topics.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                );
              })}

              <Button
                startIcon={<Add />}
                onClick={() =>
                  setEditFormData((prev) => ({
                    ...prev,
                    topics: [...prev.topics, { topic_name: "" }],
                  }))
                }
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
              >
                Add Topic
              </Button>

              {errors.topics && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {errors.topics}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={creating}
            sx={{
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {creating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectDetails;
