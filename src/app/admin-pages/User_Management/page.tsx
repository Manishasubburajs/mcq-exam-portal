"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import {
  VpnKey,
  Delete,
  PersonAdd,
  Download,
  Menu,
  Edit,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteModal";

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  grade?: string | null;
  section?: string | null;
  status: "active" | "inactive" | "pending";
}

const UserManagement: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          console.error("Failed to fetch users:", data.error);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddUser = () => setAddUserOpen(true);
  // const handleEditUser = (user: User) => {
  //   setEditingUser(user);
  //   setEditUserOpen(true);
  // };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const handleDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setConfirmDeleteOpen(true);
  };

  const handleResetPassword = (userName: string) => {
    if (
      window.confirm(
        `Reset password for ${userName}? A temporary password will be sent to their email.`
      )
    ) {
      alert(`Password reset email sent to ${userName}`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`
      )
    ) {
      try {
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id }),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
          alert("User deleted successfully");
        } else {
          alert("Error: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong!");
      }
    }
  };

  const handleExportUsers = () => {
    alert("Exporting user list as CSV...");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "primary";
      case "teacher":
        return "success";
      case "admin":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  // Filter users by tab, search, status, class
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || user.status === statusFilter;

    const userClass =
      user.grade || user.section
        ? `${user.grade || ""}${user.section ? ` - ${user.section}` : ""}`
        : "";
    const matchesClass = !classFilter || userClass === classFilter;

    const matchesTab =
      (activeTab === 0 && user.role === "student") ||
      (activeTab === 1 && user.role === "teacher") ||
      (activeTab === 2 && user.role === "admin");

    return matchesSearch && matchesStatus && matchesClass && matchesTab;
  });

  // Unique class/group list
  const classGroups = Array.from(
    new Set(
      users
        .filter((u) => u.grade || u.section)
        .map((u) => `${u.grade || ""}${u.section ? ` - ${u.section}` : ""}`)
    )
  );

  return (
    <div>
      <Box
        sx={{ display: "flex", minHeight: "100vh", backgroundColor: "grey.50" }}
      >
        <Sidebar isOpen={sidebarOpen} />
        <Box
          className={`main-content ${
            sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
          sx={{ flex: 1, p: 3 }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 1 }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h4" sx={{ color: "#2c3e50" }}>
                User Management
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src="https://ui-avatars.com/api/?name=Admin+User&background=6a11cb&color=fff"
                alt="Admin User"
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid #6a11cb",
                  mr: 1,
                }}
              />
              <Typography variant="body1">Administrator</Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                },
              }}
            >
              <Tab
                label={`Students (${
                  users.filter((u) => u.role === "student").length
                })`}
              />
              <Tab
                label={`Teachers (${
                  users.filter((u) => u.role === "teacher").length
                })`}
              />
              <Tab
                label={`Administrators (${
                  users.filter((u) => u.role === "admin").length
                })`}
              />
            </Tabs>
          </Paper>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#2c3e50" }}>
              Filter Users
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200, flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Class/Group</InputLabel>
                <Select
                  value={classFilter}
                  label="Class/Group"
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classGroups.map((cg) => (
                    <MenuItem key={cg} value={cg}>
                      {cg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setClassFilter("");
                }}
              >
                Reset Filters
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  fontWeight: 600,
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(to right, #5b0eb5, #1e63d6)",
                  },
                }}
              >
                Apply Filters
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<PersonAdd />}
                onClick={handleAddUser}
              >
                Add New User
              </Button>
            </Box>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ borderRadius: 2 }}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "#2c3e50" }}>
                {activeTab === 0
                  ? "All Students"
                  : activeTab === 1
                  ? "All Teachers"
                  : "All Administrators"}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportUsers}
              >
                Export Users
              </Button>
            </Box>

            {loading ? (
              <Typography sx={{ p: 3 }}>Loading users...</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Class/Group
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Exams Taken
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredUsers.map((user) => {
                      const fullName = `${user.first_name} ${user.last_name}`;
                      const classGroup =
                        user.grade || user.section
                          ? `${user.grade || ""}${
                              user.section ? ` - ${user.section}` : ""
                            }`
                          : "-";

                      return (
                        <TableRow key={user.user_id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ mr: 2 }}>
                                {user.first_name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {fullName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              }
                              color={getRoleColor(user.role) as any}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>{classGroup}</TableCell>

                          <TableCell>
                            <Chip
                              label={
                                user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)
                              }
                              color={getStatusColor(user.status) as any}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Edit User" arrow>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reset Password" arrow>
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleResetPassword(fullName)}
                                >
                                  <VpnKey />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete User" arrow>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteConfirm(user)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Pagination
                count={5}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserAdded={(newUser) => setUsers((prev) => [...prev, newUser])}
      />
      <EditUserModal
        open={editUserOpen}
        onClose={() => setEditUserOpen(false)}
        user={selectedUser}
        onUserUpdated={(updated) =>
          setUsers((prev) =>
            prev.map((u) => (u.user_id === updated.user_id ? updated : u))
          )
        }
      />

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        userName={
          selectedUser
            ? `${selectedUser.first_name} ${selectedUser.last_name}`
            : ""
        }
        onConfirm={() => handleDeleteUser(selectedUser as User)}
      />
    </div>
  );
};

export default UserManagement;