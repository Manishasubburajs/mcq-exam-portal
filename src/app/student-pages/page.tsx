"use client";

import type { ReactNode } from "react";
import { Box, Typography, Card, Button, useTheme, useMediaQuery, Avatar, Chip } from "@mui/material";
// use CSS grid with Box for consistent layout and spacing
import { useRouter } from "next/navigation";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import StarRateIcon from "@mui/icons-material/StarRate";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EventIcon from "@mui/icons-material/Event";
import GradeIcon from "@mui/icons-material/Grade";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const MAIN_BG = "#f5f7fa";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#e0e0e0";
const TEXT_SECONDARY = "#64748b";
const TEXT_PRIMARY = "#1e293b";
const PRIMARY_PURPLE = "#2f13c9ff";
const SUCCESS_GREEN = "#22c55e";
const WARNING_YELLOW = "#f59e0b";
const DANGER_RED = "#ef4444";
const INFO_BLUE = "#2679d9ff";
const EXAM_META_COLOR = TEXT_SECONDARY;

// Shared action button sizing and styles so all action buttons look identical
const ACTION_BUTTON_MD_WIDTH = '160px';
const ACTION_BUTTON_SX = {
  // horizontal padding kept for visual spacing; height and lineHeight enforce identical vertical size
  padding: '0 14px',
  height: '40px',
  lineHeight: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'none',
  backgroundColor: PRIMARY_PURPLE,
  color: '#fff',
  borderRadius: 2,
  fontSize: '15px',
  fontWeight: 700,
  boxShadow: 'none',
};

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  iconColor?: string;
}

const StatCard = ({ icon, label, value, color, iconColor }: StatCardProps) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      width: '100%',
      display: "flex",
      alignItems: "center",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.875 }}>
      <Avatar
        sx={{
          width: 60,
          height: 60,
          bgcolor: color,
          color: iconColor || "#fff",
          fontSize: "24px",
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1, mb: 0.625, color: TEXT_PRIMARY }}>
          {value}
        </Typography>
        <Typography sx={{ color: '#7f8c8d', fontSize: 14 }}>{label}</Typography>
      </Box>
    </Box>
  </Card>
);

interface ExamMeta {
  duration: string | number;
  questions: string | number;
  due: string;
  points: string | number;
}

interface ExamCardProps {
  title: string;
  subject: string;
  meta: ExamMeta;
  onStart?: () => void;
}

interface CompletedExam {
  title: string;
  subject: string;
  scorePercentage: number;
  completionDate: string;
  timeTaken: string;
  scoreFraction: string;
  rank: string;
}

interface UpcomingExam {
  title: string;
  subject: string;
  duration: string;
  questions: number;
  scheduledDate: string;
  points: number;
}

const ExamCard = ({ title, subject, meta, onStart }: ExamCardProps) => (
  <Card
    sx={{
      border: `1px solid #e0e0e0`,
      borderRadius: 2.5,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      width: '100%',
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box sx={{ p: 1.875, background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.625, color: '#2c3e50' }}>{title}</Typography>
      <Typography sx={{ color: '#7f8c8d', fontSize: 14 }}>{subject}</Typography>
    </Box>
    <Box sx={{ p: 1.875 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1.875 }}>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{meta.duration} min</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <HelpOutlineIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{meta.questions} questions</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <EventIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>Due: {meta.due}</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <GradeIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{meta.points} points</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Chip sx={{ background: '#e6f4ea', color: '#137333', borderRadius: '20px', padding: '5px 10px', fontSize: 12, fontWeight: 600 }} label="Available" size="small" />
          {/* Placeholder for any left-side inline items if needed */}
        </Box>

        <Box sx={{ width: { xs: '100%', md: ACTION_BUTTON_MD_WIDTH }, display: 'flex' }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              padding: '8px 15px',
              height: '40px',
              lineHeight: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'none',
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              color: '#fff',
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={onStart}
          >
            Start Exam
          </Button>
        </Box>
      </Box>
    </Box>
  </Card>
);

const CompletedExamCard = ({ exam, onView }: { exam: CompletedExam; onView?: () => void }) => {
  const scoreColor = exam.scorePercentage >= 90 ? "#28a745" : exam.scorePercentage >= 70 ? "#ffc107" : "#dc3545";
  return (
    <Card
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2.5,
        background: '#ffffff',
        color: TEXT_PRIMARY,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
        width: '100%',
        overflow: "hidden",
        transition: "transform 0.3s, box-shadow 0.3s",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Box sx={{ p: 1, background: '#f6f7f8', borderBottom: '1px solid #eef2f6', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.2, color: TEXT_PRIMARY }}>{exam.title}</Typography>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: 12 }}>{exam.subject}</Typography>
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, textAlign: 'center', mb: 1, color: scoreColor }}>{exam.scorePercentage}%</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1 }}>
          <Box sx={{ flex: "1 0 50%", mb: 0.75, display: "flex", alignItems: "center", gap: 0.25 }}>
            <CalendarTodayIcon fontSize="small" sx={{ color: '#6a11cb' }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 12 }}>Completed: {exam.completionDate}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.6, display: "flex", alignItems: "center", gap: 0.25 }}>
            <ScheduleIcon fontSize="small" sx={{ color: '#6a11cb' }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 12 }}>Time: {exam.timeTaken}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.6, display: "flex", alignItems: "center", gap: 0.25 }}>
            <GradeIcon fontSize="small" sx={{ color: '#6a11cb' }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 12 }}>Score: {exam.scoreFraction}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.6, display: "flex", alignItems: "center", gap: 0.25 }}>
            <EmojiEventsIcon fontSize="small" sx={{ color: '#6a11cb' }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 12 }}>Rank: {exam.rank}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 1.5, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Chip
            label="Completed"
            sx={{ background: '#e8f0ff', color: '#2b6cb0', borderRadius: '16px', padding: '4px 8px', fontSize: 12 }}
            size="small"
          />

          <Box sx={{ width: ACTION_BUTTON_MD_WIDTH, display: 'flex' }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                padding: '8px 15px',
                height: '40px',
                lineHeight: '40px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'none',
                background: '#28a745',
                color: '#fff',
                borderRadius: 2,
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
              onClick={onView}
            >
              View Results
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const UpcomingExamCard = ({ exam }: { exam: UpcomingExam }) => (
  <Card
    sx={{
      border: `1px solid #e0e0e0`,
      borderRadius: 2.5,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      width: '100%',
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box sx={{ p: 1.875, background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.625, color: '#2c3e50' }}>{exam.title}</Typography>
      <Typography sx={{ color: '#7f8c8d', fontSize: 14 }}>{exam.subject}</Typography>
    </Box>
    <Box sx={{ p: 1.875 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1.875 }}>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{exam.duration} min</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <HelpOutlineIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{exam.questions} questions</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <EventIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{exam.scheduledDate}</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "center", gap: 0.625 }}>
          <GradeIcon fontSize="small" sx={{ color: '#6a11cb' }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 14 }}>{exam.points} points</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip sx={{ background: '#fce8e6', color: '#c5221f', borderRadius: '20px', padding: '5px 10px', fontSize: 12, fontWeight: 600 }} label="Not Available Yet" size="small" />
        </Box>

        <Box sx={{ width: { xs: '100%', md: ACTION_BUTTON_MD_WIDTH }, display: 'flex' }}>
          <Button
            variant="outlined"
            fullWidth
            disabled
            sx={{
              padding: '8px 15px',
              height: '40px',
              lineHeight: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'none',
              background: 'transparent',
              border: '1px solid #2575fc',
              color: '#2575fc',
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Starts Soon
          </Button>
        </Box>
      </Box>
    </Box>
  </Card>
);

const ActionCard = ({ button }: { button: ReactNode }) => (
  <Card
    sx={{
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 2,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: '100%',
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
      },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
    }}
  >
    {button}
  </Card>
);

const upcomingExams: UpcomingExam[] = [
  { title: "Chemistry Final", subject: "Science", duration: "90", questions: 50, scheduledDate: "Nov 20, 2023", points: 150 },
];

export default function StudentDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, color: TEXT_PRIMARY, background: MAIN_BG, minHeight: "100vh", p: 3.75 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3.75, pb: 1.875, borderBottom: '1px solid #e0e0e0', flexDirection: isMobile ? "column" : "row" }}>
        <Typography variant="h2" sx={{ fontSize: "24px", color: TEXT_PRIMARY, fontFamily: 'system-ui, sans-serif', fontWeight: 700 }}>Student Dashboard</Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: isMobile ? 1.875 : 0 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: '#6a11cb', color: "white", border: '2px solid #6a11cb' }}>JD</Avatar>
          <Typography sx={{ fontFamily: 'system-ui, sans-serif', fontWeight: 500, color: TEXT_PRIMARY }}>John Doe</Typography>
        </Box>
      </Box>

      {/* Top Stats */}
      <Box sx={{ mb: 3.75 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 2.5 }}>
          <StatCard icon={<AssignmentIcon />} label="Available Exams" value="3" color={'#e6f4ea'} iconColor={'#137333'} />
          <StatCard icon={<CheckCircleIcon />} label="Completed Exams" value="5" color={'#e8f0fe'} iconColor={'#1a73e8'} />
          <StatCard icon={<ScheduleIcon />} label="Pending Results" value="2" color={'#fef7e0'} iconColor={'#e37400'} />
          <StatCard icon={<StarRateIcon />} label="Average Score" value="82%" color={'#fce8e6'} iconColor={'#c5221f'} />
        </Box>
      </Box>

      {/* Available Exams */}
      <Box sx={{ mb: 3.75 }}>
        <Card
          sx={{
            background: CARD_BG,
            borderRadius: 2.5,
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
            p: 3.125,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 1.875, borderBottom: `2px solid #f0f0f0`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 20 }}>Available Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: '#2575fc', borderColor: '#2575fc', fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1 : 0, background: 'transparent' }}
              onClick={() => router.push('/student-pages/exam-history')}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2.5,
              alignItems: 'start',
            }}
          >
            <Box>
              <ExamCard
                title="Mathematics Midterm"
                subject="Mathematics"
                meta={{ duration: "45", questions: "30", due: "Oct 30, 2023", points: "100" }}
                onStart={() => router.push('/student-pages/take-exam')}
              />
            </Box>
            <Box>
              <ExamCard
                title="Science Quiz"
                subject="Science"
                meta={{ duration: "30", questions: "20", due: "Nov 5, 2023", points: "50" }}
                onStart={() => router.push('/student-pages/take-exam')}
              />
            </Box>
            <Box>
              <ExamCard
                title="History Final"
                subject="History"
                meta={{ duration: "60", questions: "40", due: "Nov 15, 2023", points: "100" }}
                onStart={() => router.push('/student-pages/take-exam')}
              />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Completed Exams */}
      <Box sx={{ mb: 3.75 }}>
        <Card sx={{ background: CARD_BG, borderRadius: 2.5, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)", p: 3.125 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 1.875, borderBottom: `2px solid #f0f0f0`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 20 }}>Completed Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: '#2575fc', borderColor: '#2575fc', fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1 : 0, background: 'transparent' }}
              onClick={() => router.push('/student-pages/exam-history')}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2.5,
              alignItems: 'stretch',
            }}
          >
            <Box>
              <CompletedExamCard exam={{ title: "Algebra Basics", subject: "Mathematics", scorePercentage: 92, completionDate: "Oct 15, 2023", timeTaken: "28/30 min", scoreFraction: "46/50", rank: "5/120" }} onView={() => router.push('/student-pages/exam-history')} />
            </Box>
            <Box>
              <CompletedExamCard exam={{ title: "Physics Test", subject: "Science", scorePercentage: 78, completionDate: "Oct 10, 2023", timeTaken: "42/45 min", scoreFraction: "39/50", rank: "32/120" }} onView={() => router.push('/student-pages/exam-history')} />
            </Box>
            <Box>
              <CompletedExamCard exam={{ title: "World History", subject: "History", scorePercentage: 65, completionDate: "Oct 5, 2023", timeTaken: "55/60 min", scoreFraction: "65/100", rank: "78/120" }} onView={() => router.push('/student-pages/exam-history')} />
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Upcoming Exams */}
      <Box sx={{ mb: 3.75 }}>
        <Card sx={{ background: CARD_BG, borderRadius: 2.5, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)", p: 3.125 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 1.875, borderBottom: `2px solid #f0f0f0`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 20 }}>Upcoming Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: '#2575fc', borderColor: '#2575fc', fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1 : 0, background: 'transparent' }}
              onClick={() => router.push('/student-pages/progress')}
            >
              View Calendar
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2.5,
              alignItems: 'start',
            }}
          >
            <Box>
              <UpcomingExamCard exam={upcomingExams[0]} />
            </Box>
            <Box sx={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
              <Card
                sx={{
                  border: `1px solid #e0e0e0`,
                  borderRadius: 2.5,
                  background: CARD_BG,
                  color: '#7f8c8d',
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
                  width: '100%',
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Box sx={{ position: "relative", mb: 1.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 36, color: '#7f8c8d' }} />
                  <Typography sx={{ position: "absolute", top: -4, right: -4, fontSize: 20, color: '#7f8c8d', fontWeight: "bold" }}>+</Typography>
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#7f8c8d', textAlign: "center", mb: 1 }}>No More Upcoming Exams</Typography>
                <Typography sx={{ fontSize: 14, color: '#7f8c8d', textAlign: "center" }}>Check back later for new exam schedules</Typography>
              </Card>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
