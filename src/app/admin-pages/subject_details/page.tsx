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
  Alert,
  Snackbar,
  AlertTitle,
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import dynamic from "next/dynamic";
import * as yup from "yup";
import { styled } from "@mui/material/styles";

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
    .of(yup.string().trim().required("Topic name is required"))
    .test(
      "at-least-one-topic",
      "Enter at least one topic",
      (topics) =>
        Array.isArray(topics) &&
        topics.some((topic) => topic && topic.trim() !== ""),
    )
    .test("no-duplicates", "Duplicate topics are not allowed", (topics) => {
      if (!topics) return true;
      const cleaned = topics
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== "");
      return new Set(cleaned).size === cleaned.length;
    }),
});

const editSubjectSchema = yup.object({
  subject_name: yup.string().required("Subject name is required"),
  topics: yup
    .array()
    .of(
      yup.object({
        topic_name: yup.string().trim().required("Topic name is required"),
      }),
    )
    .test(
      "at-least-one-topic",
      "Enter at least one topic",
      (topics) =>
        Array.isArray(topics) &&
        topics.some((t) => t.topic_name && t.topic_name.trim() !== ""),
    )
    .test("no-duplicates", "Duplicate topics are not allowed", (topics) => {
      if (!topics) return true;

      const cleaned = topics
        .map((t) => t.topic_name.trim().toLowerCase())
        .filter((t) => t !== "");

      return new Set(cleaned).size === cleaned.length;
    }),
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
}));

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    subjectId: number | null;
    subjectName: string;
  }>({
    open: false,
    subjectId: null,
    subjectName: "",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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

  useEffect(() => {
    if (createModalOpen) {
      resetForm();
    }
  }, [createModalOpen]);

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    resetForm();
  };

  const onCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedSubject(null);
    setErrors({});
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subject_name: "",
      topics: [""],
    });
    setErrors({});
  };

  // validate create form
  const validateForm = async (data: CreateSubjectForm) => {
    try {
      await createSubjectSchema.validate(data, { abortEarly: false });
      setErrors({});
    } catch (err: any) {
      const newErrors: any = {};

      err.inner.forEach((e: any) => {
        if (e.path === "subject_name") newErrors.subject_name = e.message;
        else if (e.path === "topics") newErrors.topics = e.message;
        else if (e.path?.startsWith("topics")) {
          const index = e.path.match(/\d+/)?.[0];
          newErrors[`topic_${index}`] = e.message;
        }
      });

      setErrors(newErrors);
    }
  };

  const validateCreateField = async (
    field: "subject_name" | "topics",
    value: any,
    index?: number,
  ) => {
    try {
      if (field === "subject_name") {
        await createSubjectSchema.validateAt("subject_name", {
          ...formData,
          subject_name: value,
        });

        setErrors((prev: any) => {
          const { subject_name, ...rest } = prev;
          return rest;
        });
      }

      if (field === "topics" && index !== undefined) {
        if (!value.trim()) {
          setErrors((prev: any) => ({
            ...prev,
            [`topic_${index}`]: "Topic name is required",
          }));
        } else {
          setErrors((prev: any) => {
            const { [`topic_${index}`]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    } catch (err: any) {
      if (field === "subject_name") {
        setErrors((prev: any) => ({
          ...prev,
          subject_name: err.message,
        }));
      }
    }
  };

  // Validate edit form
  const validateEditForm = async (data: EditSubjectForm) => {
    try {
      await editSubjectSchema.validate(data, { abortEarly: false });
      setErrors({});
    } catch (err: any) {
      const newErrors: any = {};

      err.inner.forEach((e: any) => {
        if (e.path === "subject_name") newErrors.subject_name = e.message;
        else if (e.path === "topics") newErrors.topics = e.message;
        else if (e.path?.includes("topic_name")) {
          const index = e.path.match(/\d+/)?.[0];
          newErrors[`edit_topic_${index}`] = e.message;
        }
      });

      setErrors(newErrors);
    }
  };

  // Add new topic field
  const addTopic = () => {
    setFormData((prev) => ({
      ...prev,
      topics: [...prev.topics, ""],
    }));

    // remove global topics error when adding new row
    setErrors((prev: any) => {
      if (prev.topics === "Enter at least one topic") {
        const { topics, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  const checkDuplicateTopics = (topics: string[]) => {
    const cleaned = topics
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    return new Set(cleaned).size !== cleaned.length;
  };

  const checkDuplicateEditTopics = (topics: EditTopic[]) => {
    const cleaned = topics
      .map((t) => t.topic_name.trim().toLowerCase())
      .filter((t) => t !== "");

    return new Set(cleaned).size !== cleaned.length;
  };

  const updateTopic = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedTopics = prev.topics.map((t, i) =>
        i === index ? value : t,
      );

      // 1️⃣ Required validation (field-level)
      if (!value.trim()) {
        setErrors((prevErr: any) => ({
          ...prevErr,
          [`topic_${index}`]: "Topic name is required",
        }));
      } else {
        setErrors((prevErr: any) => {
          const { [`topic_${index}`]: _, ...rest } = prevErr;
          return rest;
        });
      }

      // 2️⃣ Clear "Enter at least one topic"
      if (updatedTopics.some((t) => t.trim() !== "")) {
        setErrors((prevErr: any) => {
          const { topics, ...rest } = prevErr;
          return rest;
        });
      }

      // 3️⃣ DUPLICATE CHECK (array-level handled manually)
      if (checkDuplicateTopics(updatedTopics)) {
        setErrors((prevErr: any) => ({
          ...prevErr,
          topics: "Duplicate topics are not allowed",
        }));
      } else {
        setErrors((prevErr: any) => {
          const { topics, ...rest } = prevErr;
          return rest;
        });
      }

      return {
        ...prev,
        topics: updatedTopics,
      };
    });
  };

  const removeTopic = (index: number) => {
    const updatedTopics = formData.topics.filter((_, i) => i !== index);

    const newData = { ...formData, topics: updatedTopics };
    setFormData(newData);
    validateForm(newData);
  };

  const handleSubmit = async () => {
    try {
      setCreating(true);

      // Validate form using Yup
      await createSubjectSchema.validate(formData, { abortEarly: false });

      // Clear previous errors
      setErrors({});

      // Call your API
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showSnackbar("Subject created successfully!", "success");
        setCreateModalOpen(false);
        resetForm();
        fetchSubjects(); // Refresh list
      } else {
        if (data.errors) {
          const newErrors: any = {};
          data.errors.forEach((error: string) => {
            if (error.includes("subject_name")) newErrors.subject_name = error;
            if (error.includes("topics")) newErrors.topics = error;
          });
          setErrors(newErrors);
        } else {
          showSnackbar(
            `Error: ${data.message || "Failed to create subject"}`,
            "error",
          );
        }
      }
    } catch (err: any) {
      // Handle Yup errors
      if (err.inner && err.inner.length > 0) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path === "subject_name") newErrors.subject_name = e.message;
          else if (e.path === "topics") newErrors.topics = e.message;
          else if (e.path?.startsWith("topics")) {
            const index = e.path.match(/\d+/)?.[0];
            if (index !== undefined) newErrors[`topic_${index}`] = e.message;
          }
        });
        setErrors(newErrors);
      }
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

      await editSubjectSchema.validate(editFormData, { abortEarly: false });

      // Clear previous errors
      setErrors({});

      // build payload after validation
      const payload = {
        subject_name: editFormData.subject_name,
        topics: editFormData.topics
          .filter((t) => t.topic_name.trim() !== "")
          .map((t) => ({
            topic_id: t.topic_id,
            topic_name: t.topic_name,
          })),
      };

      const res = await fetch(
        `/api/subjects?id=${selectedSubject.subject_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        showSnackbar("Subject updated successfully!", "success");
        setEditModalOpen(false);
        setSelectedSubject(null);
        setErrors({});
        fetchSubjects();
      } else {
        showSnackbar(
          data.message || "Failed to update subject",
          "error",
        );
      }
    } catch (err: any) {
      if (err.inner && err.inner.length > 0) {
        const newErrors: any = {};

        err.inner.forEach((e: any) => {
          if (e.path === "subject_name") newErrors.subject_name = e.message;
          else if (e.path === "topics") newErrors.topics = e.message;
          else if (e.path?.includes("topic_name")) {
            const index = e.path.match(/\d+/)?.[0];
            newErrors[`edit_topic_${index}`] = e.message;
          }
        });

        setErrors(newErrors);
      }
    } finally {
      setCreating(false);
    }
  };

  // Handle delete subject
  const confirmDelete = async () => {
    if (!deleteDialog.subjectId) return;

    try {
      const res = await fetch(`/api/subjects?id=${deleteDialog.subjectId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setDeleteDialog({ open: false, subjectId: null, subjectName: "" });
        showSnackbar("Subject deleted successfully!", "success");
        fetchSubjects();
      } else {
        showSnackbar(
          data.message || "Failed to delete subject",
          "error",
        );
      }
    } catch (error) {
      showSnackbar("Network error or server unavailable", "error");
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
                                    setDeleteDialog({
                                      open: true,
                                      subjectId: subject.subject_id,
                                      subjectName: subject.subject_name,
                                    })
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
      <StyledDialog
        open={createModalOpen}
        onClose={closeCreateModal}
        maxWidth="sm"
        fullWidth
      >
        {/* Header */}
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
          Create Subject / Topic
          <IconButton
            aria-label="close"
            onClick={closeCreateModal}
            sx={(theme) => ({
              position: "absolute",
              right: 12,
              top: 12,
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Body */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Subject Name */}
            <TextField
              fullWidth
              label="Subject Name"
              value={formData.subject_name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  subject_name: e.target.value,
                }));
                validateCreateField("subject_name", e.target.value);
              }}
              error={!!errors.subject_name}
              helperText={errors.subject_name}
              placeholder="e.g., Mathematics, Science, History"
            />

            {/* Topics */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
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
                    error={!!errors[`topic_${index}`]}
                    helperText={errors[`topic_${index}`]}
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
          <Button onClick={closeCreateModal}>Cancel</Button>
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
      </StyledDialog>

      {/* Edit Subject Modal */}
      <StyledDialog
        open={editModalOpen}
        onClose={onCloseEditModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
          Edit Subject / Topic
          <IconButton
            aria-label="close"
            onClick={onCloseEditModal}
            sx={(theme) => ({
              position: "absolute",
              right: 12,
              top: 12,
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Subject Name */}
            <TextField
              fullWidth
              label="Subject Name"
              value={editFormData.subject_name}
              disabled={subjectHasLockedTopics}
              onChange={(e) => {
                const newData = {
                  ...editFormData,
                  subject_name: e.target.value,
                };
                setEditFormData(newData);
                validateEditForm(newData);
              }}
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
                        const value = e.target.value;

                        setEditFormData((prev) => {
                          const updatedTopics = prev.topics.map((t, i) =>
                            i === index ? { ...t, topic_name: value } : t,
                          );

                          // 1️⃣ Required validation
                          if (!value.trim()) {
                            setErrors((prevErr: any) => ({
                              ...prevErr,
                              [`edit_topic_${index}`]: "Topic name is required",
                            }));
                          } else {
                            setErrors((prevErr: any) => {
                              const { [`edit_topic_${index}`]: _, ...rest } =
                                prevErr;
                              return rest;
                            });
                          }

                          // 2️⃣ Clear "Enter at least one topic"
                          if (
                            updatedTopics.some(
                              (t) => t.topic_name.trim() !== "",
                            )
                          ) {
                            setErrors((prevErr: any) => {
                              const { topics, ...rest } = prevErr;
                              return rest;
                            });
                          }

                          // 3️⃣ Duplicate validation (EDIT)
                          if (checkDuplicateEditTopics(updatedTopics)) {
                            setErrors((prevErr: any) => ({
                              ...prevErr,
                              topics: "Duplicate topics are not allowed",
                            }));
                          } else {
                            setErrors((prevErr: any) => {
                              const { topics, ...rest } = prevErr;
                              return rest;
                            });
                          }

                          return {
                            ...prev,
                            topics: updatedTopics,
                          };
                        });
                      }}
                      error={!isLocked && !!errors[`edit_topic_${index}`]}
                      helperText={
                        isLocked
                          ? "Cannot edit topic: questions exist"
                          : errors[`edit_topic_${index}`]
                      }
                    />

                    {!isLocked && (
                      <IconButton
                        color="error"
                        size="small"
                        title="Remove Topic"
                        onClick={() => {
                          let updated = editFormData.topics.filter(
                            (_, i) => i !== index,
                          );

                          if (updated.length === 0) {
                            updated = [{ topic_name: "" }];
                          }

                          const newData = { ...editFormData, topics: updated };
                          setEditFormData(newData);
                          validateEditForm(newData);
                        }}
                      >
                        <Close />
                      </IconButton>
                    )}
                  </Box>
                );
              })}

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
                onClick={() => {
                  const newData = {
                    ...editFormData,
                    topics: [...editFormData.topics, { topic_name: "" }],
                  };
                  setEditFormData(newData);

                  // remove global topics error
                  setErrors((prev: any) => {
                    if (prev.topics === "Enter at least one topic") {
                      const { topics, ...rest } = prev;
                      return rest;
                    }
                    return prev;
                  });
                }}
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
          <Button onClick={onCloseEditModal}>Cancel</Button>

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
      </StyledDialog>

      <StyledDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, subjectId: null, subjectName: "" })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
          Confirm Delete
          <IconButton
            aria-label="close"
            onClick={() =>
              setDeleteDialog({ open: false, subjectId: null, subjectName: "" })
            }
            sx={(theme) => ({
              position: "absolute",
              right: 12,
              top: 12,
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete <b>{deleteDialog.subjectName}</b>?{" "}
            This will also delete all its topics.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, subjectId: null, subjectName: "" })
            }
          >
            Cancel
          </Button>

          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubjectDetails;
