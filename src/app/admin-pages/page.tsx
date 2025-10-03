"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, useMediaQuery } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import ActivityList from '../components/ActivityList';
import QuickActionCard from '../components/QuickActionCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Home() {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width:768px)');
  const isMobile = useMediaQuery('(max-width:767px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const stats = [
    {
      title: '1,247',
      subtitle: 'Total Students',
      trend: '12% increase this month',
      trendUp: true,
      icon: 'School',
      color: 'white',
      bgColor: 'linear-gradient(135deg, #4caf50, #66bb6a)',
    },
    {
      title: '86',
      subtitle: 'Active Exams',
      trend: '5 new exams this week',
      trendUp: true,
      icon: 'Assignment',
      color: 'white',
      bgColor: 'linear-gradient(135deg, #2196f3, #42a5f5)',
    },
    {
      title: '2,548',
      subtitle: 'Questions in Bank',
      trend: '42 added today',
      trendUp: true,
      icon: 'HelpOutline',
      color: 'white',
      bgColor: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    },
    {
      title: '78.5%',
      subtitle: 'Average Performance',
      trend: '2.3% from last month',
      trendUp: false,
      icon: 'TrendingUp',
      color: 'white',
      bgColor: 'linear-gradient(135deg, #f44336, #ef5350)',
    },
  ];

  const examActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Exams Taken',
        data: [45, 62, 58, 71, 84, 52, 38],
        backgroundColor: 'rgba(106, 17, 203, 0.7)',
        borderColor: 'rgba(106, 17, 203, 1)',
        borderWidth: 1,
      },
      {
        label: 'Exams Created',
        data: [3, 5, 4, 7, 6, 2, 1],
        backgroundColor: 'rgba(37, 117, 252, 0.7)',
        borderColor: 'rgba(37, 117, 252, 1)',
        borderWidth: 1,
      },
    ],
  };

  const examActivityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const subjectPerformanceData = {
    labels: ['Mathematics', 'Science', 'History', 'English', 'Geography'],
    datasets: [
      {
        data: [85, 78, 72, 80, 75],
        backgroundColor: [
          'rgba(106, 17, 203, 0.7)',
          'rgba(37, 117, 252, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(40, 167, 69, 0.7)',
          'rgba(220, 53, 69, 0.7)',
        ],
        borderColor: [
          'rgba(106, 17, 203, 1)',
          'rgba(37, 117, 252, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const subjectPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const performanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Average Score',
        data: [72, 75, 78, 76, 80, 82, 85],
        borderColor: 'rgba(106, 17, 203, 1)',
        backgroundColor: 'rgba(106, 17, 203, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Pass Rate',
        data: [68, 72, 75, 73, 78, 80, 83],
        borderColor: 'rgba(37, 117, 252, 1)',
        backgroundColor: 'rgba(37, 117, 252, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const performanceTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const activities = [
    {
      icon: 'Assignment',
      title: 'New exam "Advanced Calculus" created',
      time: '10 minutes ago • By Dr. Smith',
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      icon: 'PersonAdd',
      title: '15 new students registered',
      time: '1 hour ago • System',
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      icon: 'Backup',
      title: 'System backup completed successfully',
      time: '3 hours ago • Automated',
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      icon: 'Publish',
      title: 'Chemistry Midterm results published',
      time: '5 hours ago • By Dr. Johnson',
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      icon: 'ReportProblem',
      title: '3 exam attempts flagged for review',
      time: 'Yesterday • System',
      color: 'error.main',
      bgColor: 'error.light',
    },
  ];

  const actions = [
    {
      icon: 'AddCircle',
      title: 'Create Exam',
      description: 'Set up a new examination',
    },
    {
      icon: 'Person',
      title: 'Manage Users',
      description: 'Add or modify user accounts',
    },
    {
      icon: 'HelpOutline',
      title: 'Question Bank',
      description: 'Manage question database',
    },
    {
      icon: 'BarChart',
      title: 'View Reports',
      description: 'Generate detailed analytics',
    },
    {
      icon: 'Settings',
      title: 'System Settings',
      description: 'Configure portal settings',
    },
    {
      icon: 'Download',
      title: 'Export Data',
      description: 'Download reports and data',
    },
  ];

  const handleActionClick = (title: string) => {
    alert(`Navigating to: ${title}`);
    // In a real application, this would redirect to the appropriate page
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Sidebar isOpen={sidebarOpen} />
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
      <Box className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatsCard key={stat.subtitle} stat={stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <ChartCard title="Exam Activity Overview" height={isMobile ? 200 : 300}>
            <Bar data={examActivityData} options={examActivityOptions} />
          </ChartCard>
          <ChartCard title="Subject Performance" height={isMobile ? 200 : 300}>
            <Doughnut data={subjectPerformanceData} options={subjectPerformanceOptions} />
          </ChartCard>
          <ChartCard title="Performance Trend" height={isMobile ? 200 : 300}>
            <Line data={performanceTrendData} options={performanceTrendOptions} />
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <Paper
          elevation={1}
          sx={{
            padding: '25px',
            borderRadius: '10px',
            marginBottom: '30px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              marginBottom: '1.25rem',
              color: '#2c3e50',
              paddingBottom: '0.625rem',
              borderBottom: '2px solid #f0f0f0',
            }}
          >
            Recent System Activity
          </Typography>
          <ActivityList activities={activities} />
        </Paper>

        {/* Quick Actions */}
        <Paper elevation={1} sx={{ padding: '25px', borderRadius: '10px' }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.25rem',
              marginBottom: '1.25rem',
              color: '#2c3e50',
              paddingBottom: '0.625rem',
              borderBottom: '2px solid #f0f0f0',
            }}
          >
            Quick Actions
          </Typography>
          <div className="actions-grid">
            {actions.map((action) => (
              <QuickActionCard key={action.title} action={action} onClick={handleActionClick} />
            ))}
          </div>
        </Paper>
      </Box>
    </Box>
  );
}