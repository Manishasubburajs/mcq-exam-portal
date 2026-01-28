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
import { Edit, PersonAdd } from "@mui/icons-material";
import dynamic from "next/dynamic";
import Sidebar from "../../components/Sidebar";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
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
      setLoading(true);
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
  const filteredUsers = React.useMemo(() => {
    const roleMap = [
      "student",
      // "teacher",
      "admin",
    ];
    const role = roleMap[tabIndex];

    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const searchValue = search.toLowerCase();

      const matchesSearch =
        fullName.includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.user_id.toString().includes(searchValue);

      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesTab = user.role === role;

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [users, tabIndex, search, statusFilter]);

  // Paginate
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage,
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
      default:
        return "default";
    }
  };

  // Reset pagination when filters/search/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, tabIndex]);

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
          sx={{
            mt: 4,
            padding: "20px",
            marginBottom: "25px",
            borderRadius: "10px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.primary">
              Filter Users
            </Typography>

            <Button
              variant="contained"
              color="success"
              startIcon={<PersonAdd />}
              onClick={() => setAddUserOpen(true)}
            >
              Add New User
            </Button>
          </Box>

          {/* Filters */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 2,
            }}
          >
            <TextField
              label="Search"
              size="small"
              placeholder="Search by ID, name or email..."
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
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Reset */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              Reset Filters
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
            {/* <Tab
              label={`Teachers (${
                users.filter((u) => u.role === "teacher").length
              })`}
            /> */}
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
                      //   return "All Teachers";
                      // case 2:
                      return "All Administrators";
                    default:
                      return "All Users";
                  }
                })()}
              </Typography>
            </Box>
          </Box>

          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ p: 5 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ p: 5 }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    paginatedUsers.map((user) => {
                      const fullName = `${user.first_name} ${user.last_name}`;
                      return (
                        <TableRow key={user.user_id} hover>
                          <TableCell>{user.user_id}</TableCell>
                          <TableCell>{fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
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
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Pagination
                disabled={loading}
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          </>
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
              //   return "teacher";
              // case 2:
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
        onUserUpdated={(updated) => {
          // Normalize the updated user data to match the expected format
          const normalizedUser = {
            ...updated,
            grade: updated.student_details?.grade || "",
            section: updated.student_details?.section || "",
            department: updated.department || "",
          };

          setUsers((prev) =>
            prev.map((u) =>
              u.user_id === updated.user_id ? normalizedUser : u,
            ),
          );
        }}
      />
    </Box>
  );
};

export default UserManagement;
