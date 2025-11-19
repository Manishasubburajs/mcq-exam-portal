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
  useMediaQuery,
} from "@mui/material";
import { Edit, Delete, VpnKey, Download, PersonAdd } from "@mui/icons-material";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";
import ConfirmDeleteDialog from "@/app/components/ConfirmDeleteModal";

const Header = dynamic(() => import("../../components/Header"), { ssr: false });

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
          const normalized = data.data.map((u: any) => ({
            ...u,
            grade: u.student_details?.grade || "",
            section: u.student_details?.section || "",
            department: u.department || "",
          }));

          setUsers(normalized);
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
    const getRoleByTabIndex = (index: number): string => {
      switch (index) {
        case 0:
          return "student";
        case 1:
          return "teacher";
        case 2:
          return "admin";
        default:
          return "student";
      }
    };

    const role = getRoleByTabIndex(tabIndex);
    const filtered = users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`;
      const matchesSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || user.status === statusFilter;

      const getUserClass = (user: User): string => {
        if (!user.grade && !user.section) return "";
        return `${user.grade || ""}${user.section ? " - " + user.section : ""}`;
      };

      const userClass = getUserClass(user);
      const matchesClass = !classFilter || userClass === classFilter;

      const matchesTab = user.role === role;

      return matchesSearch && matchesStatus && matchesClass && matchesTab;
    });
    setFilteredUsers(filtered);
  }, [users, tabIndex, search, statusFilter, classFilter]);

  // Paginate
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Unique class/group list
  const getUserClass = (user: User): string => {
    if (!user.grade && !user.section) return "";
    return `${user.grade || ""}${user.section ? " - " + user.section : ""}`;
  };

  const classGroups = Array.from(
    new Set(users.filter((u) => u.grade || u.section).map(getUserClass))
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
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "grey.50" }}
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
          title="User Management"
          sidebarOpen={sidebarOpen}
        />

        {/* Filters Section */}
        <Paper
          elevation={1}
          sx={{ padding: "20px", marginBottom: "25px", borderRadius: "10px" }}
        >
          <Typography
            variant="h6"
            sx={{ marginBottom: "15px", color: "text.primary" }}
          >
            Filter Users
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FormControl size="small">
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

            <FormControl size="small">
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "15px",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setClassFilter("");
              }}
            >
              Reset Filters
            </Button>
            <Button
              variant="contained"
              onClick={() => {}}
              sx={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<PersonAdd />}
              onClick={() => setAddUserOpen(true)}
            >
              Add New User
            </Button>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
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

        {/* Users Table */}
        <Paper elevation={1} sx={{ borderRadius: "10px", overflow: "hidden" }}>
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
                {(() => {
                  switch (tabIndex) {
                    case 0:
                      return "All Students";
                    case 1:
                      return "All Teachers";
                    case 2:
                      return "All Administrators";
                    default:
                      return "All Users";
                  }
                })()}
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Download />}
              >
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
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Class/Group
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Last Login
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedUsers.map((user) => {
                    const fullName = `${user.first_name} ${user.last_name}`;
                    const getDisplayClass = (user: User): string => {
                      if (!user.grade && !user.section) return "-";
                      return `${user.grade || ""}${
                        user.section ? " - " + user.section : ""
                      }`;
                    };

                    const classGroup = getDisplayClass(user);

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
                            color={getRoleColor(user.role)}
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
                            color={getStatusColor(user.status)}
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
                                  alert(
                                    `Password reset email sent to ${fullName}`
                                  );
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
          <Box
            sx={{ display: "flex", justifyContent: "center", padding: "20px" }}
          >
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
        defaultRole={(() => {
          switch (tabIndex) {
            case 0:
              return "student";
            case 1:
              return "teacher";
            case 2:
              return "admin";
            default:
              return "student";
          }
        })()}
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
