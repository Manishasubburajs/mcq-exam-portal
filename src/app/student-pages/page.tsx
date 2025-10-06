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
import FooterSection from "../components/FooterSection";

const MAIN_BG = "#f8f9fa";
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
      p: 3,
      borderRadius: 2,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
          fontSize: "32px",
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1, mb: 0.3125, color: TEXT_PRIMARY }}>
          {value}
        </Typography>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: 14 }}>{label}</Typography>
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
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 2,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: '100%',
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box sx={{ p: 3, background: CARD_BG, borderBottom: `1px solid ${CARD_BORDER}` }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.3125, color: TEXT_PRIMARY }}>{title}</Typography>
      <Typography sx={{ color: TEXT_SECONDARY, fontSize: 14 }}>{subject}</Typography>
    </Box>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1.875 }}>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{meta.duration} min</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <HelpOutlineIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{meta.questions} questions</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <EventIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>Due: {meta.due}</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <GradeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{meta.points} points</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mt: 1,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Chip label="Available" color="success" size="small" />
          {/* Placeholder for any left-side inline items if needed */}
        </Box>

        <Box sx={{ width: { xs: '100%', md: ACTION_BUTTON_MD_WIDTH }, display: 'flex' }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              ...ACTION_BUTTON_SX,
              backgroundColor: PRIMARY_PURPLE,
              '&:hover': { backgroundColor: '#5a3d9a', transform: 'translateY(-2px)' },
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
  const scoreColor = exam.scorePercentage >= 90 ? "#22c55e" : exam.scorePercentage >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <Card
      sx={{
        // explicit pixel styles to match reference screenshot
        border: '1px solid #e6e9ee',
        borderRadius: '8px',
        background: '#ffffff',
        color: TEXT_PRIMARY,
        boxShadow: '0 2px 6px rgba(16,24,40,0.04)',
        width: '100%',
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
        },
      }}
    >
      <Box sx={{ p: 16/8, background: '#f6f7f8', borderBottom: '1px solid #eef2f6', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.25, color: TEXT_PRIMARY }}>{exam.title}</Typography>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: 13 }}>{exam.subject}</Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1.25 }}>
          <Box sx={{ flex: "1 0 50%", mb: 0.9, display: "flex", alignItems: "center", gap: 0.25 }}>
            <GradeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
            <Typography variant="body2" sx={{ color: scoreColor, fontWeight: 600, fontSize: 13 }}>{exam.scorePercentage}%</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.75, display: "flex", alignItems: "center", gap: 0.25 }}>
            <CalendarTodayIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 13 }}>Completed {exam.completionDate}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.75, display: "flex", alignItems: "center", gap: 0.25 }}>
            <ScheduleIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 13 }}>Time {exam.timeTaken}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.75, display: "flex", alignItems: "center", gap: 0.25 }}>
            <GradeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 13 }}>Score {exam.scoreFraction}</Typography>
          </Box>
          <Box sx={{ flex: "1 0 50%", mb: 0.75, display: "flex", alignItems: "center", gap: 0.25 }}>
            <EmojiEventsIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontSize: 13 }}>Rank {exam.rank}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Chip
            label="Completed"
            sx={{ background: '#e8f0ff', color: '#2b6cb0', borderRadius: '16px', padding: '6px 12px', fontSize: 13 }}
            size="small"
          />

          <Box sx={{ width: ACTION_BUTTON_MD_WIDTH, display: 'flex' }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                ...ACTION_BUTTON_SX,
                backgroundColor: SUCCESS_GREEN,
                '&:hover': { backgroundColor: '#1e8449', transform: 'translateY(-2px)' },
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
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 2,
      background: CARD_BG,
      color: TEXT_PRIMARY,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: '100%',
      overflow: "hidden",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <Box sx={{ p: 3, background: CARD_BG, borderBottom: `1px solid ${CARD_BORDER}` }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 0.3125, color: TEXT_PRIMARY }}>{exam.title}</Typography>
      <Typography sx={{ color: TEXT_SECONDARY, fontSize: 14 }}>{exam.subject}</Typography>
    </Box>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1.875 }}>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{exam.duration} min</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <HelpOutlineIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{exam.questions} questions</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <EventIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{exam.scheduledDate}</Typography>
        </Box>
        <Box sx={{ flex: "1 0 50%", mb: 1.25, display: "flex", alignItems: "flex-end", gap: 0.3125 }}>
          <GradeIcon fontSize="small" sx={{ color: PRIMARY_PURPLE }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{exam.points} points</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mt: 1,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label="Not Available Yet" color="error" size="small" />
        </Box>

        <Box sx={{ width: { xs: '100%', md: ACTION_BUTTON_MD_WIDTH }, display: 'flex' }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              ...ACTION_BUTTON_SX,
              backgroundColor: INFO_BLUE,
              '&:hover': { backgroundColor: '#1565c0', transform: 'translateY(-2px)' },
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
        transform: "translateY(-5px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 3,
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, color: TEXT_PRIMARY, background: MAIN_BG, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: isMobile ? "column" : "row" }}>
        <Typography variant="h2" sx={{ fontSize: "32px", color: TEXT_PRIMARY, fontFamily: 'system-ui, sans-serif', fontWeight: 700 }}>Student Dashboard</Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: isMobile ? 1.875 : 0 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: PRIMARY_PURPLE, color: "white" }}>JD</Avatar>
          <Typography sx={{ fontFamily: 'system-ui, sans-serif', fontWeight: 500, color: TEXT_PRIMARY }}>John Doe</Typography>
        </Box>
      </Box>

      {/* Top Stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 2.5 }}>
          <StatCard icon={<AssignmentIcon />} label="Available Exams" value="3" color={SUCCESS_GREEN} iconColor="#fff" />
          <StatCard icon={<CheckCircleIcon />} label="Completed Exams" value="5" color={INFO_BLUE} iconColor="#fff" />
          <StatCard icon={<ScheduleIcon />} label="Pending Results" value="2" color={WARNING_YELLOW} iconColor="#fff" />
          <StatCard icon={<StarRateIcon />} label="Average Score" value="82%" color={DANGER_RED} iconColor="#fff" />
        </Box>
      </Box>

      {/* Available Exams */}
      <Box sx={{ px: isMobile ? 2 : 6, mb: '40px' }}>
        <Card
          sx={{
            background: CARD_BG,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, pb: 2, borderBottom: `2px solid ${CARD_BORDER}`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: 24 }}>Available Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: PRIMARY_PURPLE, borderColor: PRIMARY_PURPLE, fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1.25 : 0 }}
              onClick={() => router.push('/student-pages/exam-history')}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 3,
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
      <Box sx={{ px: isMobile ? 2 : 6, mb: '40px' }}>
        <Card sx={{ background: CARD_BG, borderRadius: 2, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, pb: 2, borderBottom: `2px solid ${CARD_BORDER}`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: 24 }}>Completed Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: PRIMARY_PURPLE, borderColor: PRIMARY_PURPLE, fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1.25 : 0 }}
              onClick={() => router.push('/student-pages/exam-history')}
            >
              View All
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 3,
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
      <Box sx={{ px: isMobile ? 2 : 6, mb: '40px' }}>
        <Card sx={{ background: CARD_BG, borderRadius: 2, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, pb: 2, borderBottom: `2px solid ${CARD_BORDER}`, flexDirection: isMobile ? "column" : "row" }}>
            <Typography sx={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: 24 }}>Upcoming Exams</Typography>
            <Button
              variant="outlined"
              sx={{ padding: "10px 20px", color: PRIMARY_PURPLE, borderColor: PRIMARY_PURPLE, fontSize: "16px", fontWeight: 600, borderRadius: 2, mt: isMobile ? 1.25 : 0 }}
              onClick={() => router.push('/student-pages/progress')}
            >
              View Calendar
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Box>
              <UpcomingExamCard exam={upcomingExams[0]} />
            </Box>
            <Box sx={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
              <Card
                sx={{
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 2,
                  background: CARD_BG,
                  color: EXAM_META_COLOR,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
                  p: 3,
                }}
              >
                <Box sx={{ position: "relative", mb: 2 }}>
                  <CalendarTodayIcon sx={{ fontSize: 48, color: TEXT_SECONDARY }} />
                  <Typography sx={{ position: "absolute", top: -5, right: -5, fontSize: 24, color: TEXT_SECONDARY, fontWeight: "bold" }}>+</Typography>
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: TEXT_SECONDARY, textAlign: "center" }}>No More Upcoming Exams - Check back later for new exam schedules</Typography>
              </Card>
            </Box>
          </Box>
        </Card>
      </Box>

      <FooterSection />
    </Box>
  );
}
