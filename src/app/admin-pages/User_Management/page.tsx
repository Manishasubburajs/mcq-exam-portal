"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  VpnKey,
  Delete,
  PersonAdd,
  Download,
  Menu,
  Edit,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import dynamic from 'next/dynamic';
import Sidebar from "../../components/Sidebar";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteModal";

const Header = dynamic(() => import('../../components/Header'), { ssr: false });


interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  grade?: string;
  section?: string;
  department?: string;
}

const UserManagement: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width:769px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Fetch users
  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { signal: controller.signal });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          console.error("Failed to fetch users:", data.error);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, []);

  // Filter users by tab + search + filters
  useEffect(() => {
    const role = tabIndex === 0 ? "student" : tabIndex === 1 ? "teacher" : "admin";
    const filtered = users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`;
      const matchesSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || user.status === statusFilter;

      const userClass =
        user.grade || user.section
          ? `${user.grade || ""}${user.section ? ` - ${user.section}` : ""}`
          : "";
      const matchesClass = !classFilter || userClass === classFilter;

      const matchesTab = user.role === role;

      return matchesSearch && matchesStatus && matchesClass && matchesTab;
    });
    setFilteredUsers(filtered);
  }, [users, tabIndex, search, statusFilter, classFilter]);

  // Paginate
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Unique class/group list
  const classGroups = Array.from(
    new Set(
      users
        .filter((u) => u.grade || u.section)
        .map((u) => `${u.grade || ""}${u.section ? ` - ${u.section}` : ""}`)
    )
  );

  // Color helpers
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

  // Delete handler
  const handleDeleteUser = async (user: User) => {
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
      } else {
        console.error("Delete failed:", data.error);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

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
              <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 40, height: 40, marginRight: '10px' }}>
                <AdminPanelSettings sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="body1">Administrator</Typography>
            </Box>
          </Box>
        </Paper>

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
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                Apply Filters
              </Button>

              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={handleAddUser}
              >
                Add New User
              </Button>
            </Box>
          </Paper>

        {/* Users Table */}
        <Paper elevation={1} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{ padding: '20px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                {tabIndex === 0
                  ? "All Students"
                  : tabIndex === 1
                  ? "All Teachers"
                  : "All Administrators"}
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Export Users
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
                <TableHead sx={{ backgroundColor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Class/Group</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedUsers.map((user) => {
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

                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit User" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditUserOpen(true);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reset Password" arrow>
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => {
                                  alert(`Password reset email sent to ${fullName}`);
                                }}
                              >
                                <VpnKey />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete User" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setConfirmDeleteOpen(true);
                                }}
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

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </Paper>
      </Box>

      {/* Modals */}
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserAdded={(newUser) => setUsers((prev) => [...prev, newUser])}
        defaultRole={tabIndex === 0 ? "student" : tabIndex === 1 ? "teacher" : "admin"}
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
    </Box>
  );
};

export default UserManagement;
