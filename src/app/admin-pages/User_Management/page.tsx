"use client"

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import {
  Edit,
  VpnKey,
  Delete,
  PersonAdd,
  Download,
  Menu,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

const Header = dynamic(() => import('../../components/Header'), { ssr: false });

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  classGroup: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  examsTaken: number | string;
  avatar: string;
}

const UserManagement: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width:769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // Sample user data
  const [users] = useState<User[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@school.edu',
      role: 'student',
      classGroup: '10th Grade - Section A',
      status: 'active',
      lastLogin: 'Oct 25, 2023',
      examsTaken: 15,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@school.edu',
      role: 'student',
      classGroup: '10th Grade - Section B',
      status: 'active',
      lastLogin: 'Oct 24, 2023',
      examsTaken: 12,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: 3,
      name: 'Michael Johnson',
      email: 'michael.johnson@school.edu',
      role: 'student',
      classGroup: '11th Grade - Section A',
      status: 'active',
      lastLogin: 'Oct 22, 2023',
      examsTaken: 18,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@school.edu',
      role: 'teacher',
      classGroup: 'Mathematics Dept.',
      status: 'active',
      lastLogin: 'Oct 26, 2023',
      examsTaken: 'N/A',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'robert.wilson@school.edu',
      role: 'teacher',
      classGroup: 'Science Dept.',
      status: 'inactive',
      lastLogin: 'Sep 15, 2023',
      examsTaken: 'N/A',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddUser = () => {
    setAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserOpen(true);
  };

  const handleResetPassword = (userName: string) => {
    if (window.confirm(`Reset password for ${userName}? A temporary password will be sent to their email.`)) {
      alert(`Password reset email sent to ${userName}`);
    }
  };

  const handleDeleteUser = (userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      alert(`User ${userName} has been deleted`);
    }
  };

  const handleExportUsers = () => {
    alert('Exporting user list as CSV...');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'primary';
      case 'teacher': return 'success';
      case 'admin': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesClass = !classFilter || user.classGroup === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Sidebar activeItem="User Management" isOpen={sidebarOpen} />
      {sidebarOpen && !isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} sx={{ paddingTop: { xs: '50px', md: '80px' } }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="User Management" sidebarOpen={sidebarOpen} />

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '16px',
                minHeight: '48px',
              },
            }}
          >
            <Tab label="Students (247)" />
            <Tab label="Teachers (24)" />
            <Tab label="Administrators (3)" />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
            Filter Users
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
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
                <MenuItem value="10th Grade - Section A">10th Grade - Section A</MenuItem>
                <MenuItem value="10th Grade - Section B">10th Grade - Section B</MenuItem>
                <MenuItem value="10th Grade - Section C">10th Grade - Section C</MenuItem>
                <MenuItem value="11th Grade - Section A">11th Grade - Section A</MenuItem>
                <MenuItem value="11th Grade - Section B">11th Grade - Section B</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setClassFilter('');
            }}>
              Reset Filters
            </Button>
            <Button variant="contained" onClick={() => alert('Filters applied')}>
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
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#2c3e50' }}>
              {activeTab === 0 ? 'All Students' : activeTab === 1 ? 'All Teachers' : 'All Administrators'}
            </Typography>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportUsers}>
              Export Users
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Class/Group</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Exams Taken</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} sx={{ mr: 2, width: 40, height: 40 }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.classGroup}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>{user.examsTaken}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleResetPassword(user.name)}
                        >
                          <VpnKey />
                        </IconButton>
                        {user.role === 'teacher' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user.name)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Pagination
              count={5}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </Paper>

        {/* Add User Modal */}
        <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                />
              </Box>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role">
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Class/Group</InputLabel>
                  <Select label="Class/Group">
                    <MenuItem value="10a">10th Grade - Section A</MenuItem>
                    <MenuItem value="10b">10th Grade - Section B</MenuItem>
                    <MenuItem value="10c">10th Grade - Section C</MenuItem>
                    <MenuItem value="11a">11th Grade - Section A</MenuItem>
                    <MenuItem value="11b">11th Grade - Section B</MenuItem>
                    <MenuItem value="math">Mathematics Department</MenuItem>
                    <MenuItem value="science">Science Department</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControl required>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              alert('User added successfully!');
              setAddUserOpen(false);
            }}>
              Add User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  defaultValue={editingUser?.name.split(' ')[0]}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  defaultValue={editingUser?.name.split(' ')[1]}
                />
              </Box>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                defaultValue={editingUser?.email}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" defaultValue={editingUser?.role}>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Class/Group</InputLabel>
                  <Select label="Class/Group" defaultValue={editingUser?.classGroup}>
                    <MenuItem value="10a">10th Grade - Section A</MenuItem>
                    <MenuItem value="10b">10th Grade - Section B</MenuItem>
                    <MenuItem value="10c">10th Grade - Section C</MenuItem>
                    <MenuItem value="11a">11th Grade - Section A</MenuItem>
                    <MenuItem value="11b">11th Grade - Section B</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControl required>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue={editingUser?.status}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUserOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              alert('User details updated successfully!');
              setEditUserOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserManagement;