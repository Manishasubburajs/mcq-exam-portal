"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { useMediaQuery } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/app/components/student_layout";
import LiveExamWarningModal from "@/app/components/LiveExamWarningModal";
import LateEntryModal from "@/app/components/LateEntryModal";
import LeaveExamModal from "@/app/components/LeaveExamModal";
import FullscreenExitModal from "@/app/components/FullscreenExitModal";
import styles from "./exam_taking.module.css";

interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

interface ExamData {
  title: string;
  duration: number; // minutes
  totalQuestions: number;
  questions: Question[];
  examType: "practice" | "mock" | "live";
  points?: number;
  proctoringEnabled?: boolean;
  autoSubmit?: boolean;
  startTime?: string;
  endTime?: string;
  serverTime?: string;
}

const ExamContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examStartRef = useRef<number>(Date.now());
  const examId = searchParams.get("examId");
  const attemptId = searchParams.get("attemptId");

  const isDesktop = useMediaQuery("(min-width:1024px)");
  // For exam page, we always use full width without sidebar
  const leftPosition = "0px";

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showLiveWarning, setShowLiveWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLateEntryModal, setShowLateEntryModal] = useState(false);
  const [lateEntryMinutes, setLateEntryMinutes] = useState(0);
  const [lateEntrySeconds, setLateEntrySeconds] = useState(0);
  const [resultDisplayTime, setResultDisplayTime] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showFullscreenExitModal, setShowFullscreenExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    string | undefined
  >(undefined);
  const latestAnswersRef = useRef(userAnswers);
  const latestTimeLeftRef = useRef(timeLeft);
  const latestExamDataRef = useRef(examData);

  // Function to enter fullscreen with browser compatibility
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Function to exit fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Listen for fullscreen changes with browser compatibility
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // Show modal for all exam types when exiting fullscreen
      if (!isCurrentlyFullscreen && examData && !submittingRef.current) {
        setShowFullscreenExitModal(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [examData]);

  // Enter fullscreen when exam starts for mock or live exams
  useEffect(() => {
    const initializeExam = async () => {
      if (
        examData &&
        (examData.examType === "mock" || examData.examType === "live")
      ) {
        // Wait for DOM to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Try multiple times with increasing delays
        const tryFullscreen = async (attempt: number, maxAttempts: number) => {
          if (attempt > maxAttempts) return;

          try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
              await elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
              await (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).mozRequestFullScreen) {
              await (elem as any).mozRequestFullScreen();
            } else if ((elem as any).msRequestFullscreen) {
              await (elem as any).msRequestFullscreen();
            }
          } catch (error) {
            // If fullscreen failed, try again after a delay
            if (attempt < maxAttempts) {
              setTimeout(() => tryFullscreen(attempt + 1, maxAttempts), 300);
            }
          }
        };

        tryFullscreen(1, 5);
      }
    };

    initializeExam();
  }, [examData]);

  const questionStartRef = useRef<number>(Date.now());
  const questionTimeMap = useRef<Record<number, number>>({});
  const submittingRef = useRef(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  useEffect(() => {
    if (!examId) {
      setError("No exam ID provided");
      setLoading(false);
      return;
    }

    // Check if exam was automatically submitted (e.g., on refresh)
    const autoSubmit = sessionStorage.getItem("autoSubmit");
    if (autoSubmit === "true") {
      // Remove the flag to prevent infinite redirect loop
      sessionStorage.removeItem("autoSubmit");

      // Restore saved answers before submitting
      const savedAnswers = sessionStorage.getItem(`exam_${examId}_userAnswers`);
      const savedTimes = sessionStorage.getItem(`exam_${examId}_questionTimes`);

      if (savedAnswers) {
        try {
          setUserAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error("Error parsing savedAnswers", e);
        }
      }

      if (savedTimes) {
        try {
          questionTimeMap.current = JSON.parse(savedTimes);
        } catch (e) {
          console.error("Error parsing savedTimes", e);
        }
      }

      // Submit the exam with restored answers
      setTimeout(() => {
        submitExam(true);
      }, 500);
      return;
    }

    // Initialize violation count using attemptId to ensure each attempt is separate
    const stored = sessionStorage.getItem(`violation_${attemptId}`);
    setViolationCount(stored ? parseInt(stored, 10) : 0);

    // Check for stuck attempts on page load
    const checkStuckAttempts = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await fetch(
          "/api/students/exams/check-stuck-attempts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        console.log("Check stuck attempts response:", data);
      } catch (error) {
        console.error("Error checking for stuck attempts:", error);
      }
    };

    checkStuckAttempts();
    fetchExam();
  }, [examId, attemptId]);

  const fetchExam = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/students/exams/take?id=${examId}&attemptId=${attemptId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      // ❌ API FAIL
      if (!data.success) {
        setError(data.message || "Failed to load exam");
        return;
      }

      // ✅ SUCCESS
      const exam = data.data;
      setExamData(exam);
      examStartRef.current = Date.now();

      // ✅ LIVE EXAM LOGIC
      if (exam.examType === "live") {
        const now = new Date(exam.serverTime).getTime(); // backend time
        const start = new Date(exam.startTime).getTime();
        const end = new Date(exam.endTime).getTime();

        // ❌ Safety check
        if (now < start || now > end) {
          setError("Exam not available at this time");
          return;
        }

        // ✅ Remaining time - always calculated as endTime - currentServerTime
        const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));

        setTimeLeft(remainingSeconds);

        // ✅ Delay popup - show if student joins late
        const delaySeconds = Math.floor((now - start) / 1000);

        if (delaySeconds > 0) {
          const delayMin = Math.floor(delaySeconds / 60);
          const delaySec = delaySeconds % 60;

          setTimeout(() => {
            setLateEntryMinutes(delayMin);
            setLateEntrySeconds(delaySec);
            setShowLateEntryModal(true);
          }, 500);
        }
      } else {
        // ✅ PRACTICE + MOCK
        setTimeLeft(exam.duration * 60);
      }
    } catch (err) {
      console.error("Failed to fetch exam:", err);
      setError("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!examData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, timeLeft]);

  // Use custom hook to prevent navigation within the application
  usePreventNavigation(!allowNavigation, (href?: string) => {
    setPendingNavigation(href);
    setShowLeaveModal(true);
  });

  // Handle browser back button
  useEffect(() => {
    if (allowNavigation) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setPendingNavigation(undefined);
      setShowLeaveModal(true);
      // Push current state again to block back navigation
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    // Push initial state to ensure we can block back
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [allowNavigation]);

  useEffect(() => {
    latestAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    latestTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    latestExamDataRef.current = examData;
  }, [examData]);

  // Handle page unload and tab closure
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentExam = latestExamDataRef.current;

      if (currentExam && !submittingRef.current && !allowNavigation) {
        let totalTimeTaken = 0;

        if (currentExam.examType === "live") {
          totalTimeTaken = Math.floor(
            (Date.now() - examStartRef.current) / 1000,
          );
        } else {
          totalTimeTaken =
            currentExam.duration * 60 - latestTimeLeftRef.current;
        }

        // Get studentId from token
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        let studentId = null;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            studentId = payload.userId;
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }

        const payload = {
          examId,
          attemptId,
          studentId,
          answers: latestAnswersRef.current,
          questionTimes: questionTimeMap.current,
          totalTimeTaken,
          examType: currentExam.examType,
          autoSubmitted: true,
        };

        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });

        navigator.sendBeacon("/api/students/exams/submit", blob);

        sessionStorage.setItem("autoSubmit", "true");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [examId, attemptId, allowNavigation]);

  // Prevent right-click during exam
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Right-click is disabled without any alert
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Handle ESC key for all exam types
  useEffect(() => {
    if (!examData || allowNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submittingRef.current) {
        e.preventDefault();
        setShowFullscreenExitModal(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examData, allowNavigation]);

  // Live tab switch detection
  useEffect(() => {
    if (examData?.examType !== "live" && examData?.examType !== "mock") return;

    const handleViolation = () => {
      setViolationCount((prev) => {
        const newCount = prev + 1;

        sessionStorage.setItem(`violation_${attemptId}`, newCount.toString());
        setShowLiveWarning(true);

        if (newCount >= 2 && !submittingRef.current) {
          // Calculate result display time for live exams
          if (examData?.examType === "live" && examData.endTime) {
            const endTime = new Date(examData.endTime);
            const resultTime = new Date(endTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
            const resultTimeString = resultTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            setResultDisplayTime(resultTimeString);
          }
          setTimeout(() => submitExam(true), 1500);
        }

        return newCount;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examData, attemptId]);

  // Auto-save answers periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      sessionStorage.setItem(
        `exam_${examId}_userAnswers`,
        JSON.stringify(userAnswers),
      );
      sessionStorage.setItem(
        `exam_${examId}_questionTimes`,
        JSON.stringify(questionTimeMap.current),
      );
    }, 30000); // Save every 30 seconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [userAnswers, examId]);

  // Check for auto submit flag and restore saved answers
  useEffect(() => {
    if (!examId) return; // முக்கியம்

    const autoSubmit = sessionStorage.getItem("autoSubmit");

    if (autoSubmit === "true") {
      sessionStorage.removeItem("autoSubmit");

      // Restore saved answers
      const savedAnswers = sessionStorage.getItem(`exam_${examId}_userAnswers`);
      const savedTimes = sessionStorage.getItem(`exam_${examId}_questionTimes`);

      if (savedAnswers) {
        try {
          setUserAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error("Error parsing savedAnswers", e);
        }
      }

      if (savedTimes) {
        try {
          questionTimeMap.current = JSON.parse(savedTimes);
        } catch (e) {
          console.error("Error parsing savedTimes", e);
        }
      }

      setTimeout(() => {
        submitExam(true);
      }, 1000);
    }
  }, [examId]);

  const saveQuestionTime = () => {
    const currentQ = getCurrentQuestion();
    if (currentQ) {
      const now = Date.now();
      const spent = Math.floor((now - questionStartRef.current) / 1000);
      questionTimeMap.current[currentQ.id] =
        (questionTimeMap.current[currentQ.id] || 0) + spent;
      questionStartRef.current = now;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 300) return styles.critical;
    if (timeLeft <= 600) return styles.warning;
    return "";
  };

  const getCurrentQuestion = () => {
    if (!examData || !examData.questions || examData.questions.length === 0)
      return null;
    const questionIndex = (currentQuestion - 1) % examData.questions.length;
    return examData.questions[questionIndex];
  };

  const selectOption = (optionId: string) => {
    const currentQ = getCurrentQuestion();
    if (currentQ) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQ.id]: optionId,
      }));
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const clearAnswer = () => {
    const currentQ = getCurrentQuestion();
    if (currentQ) {
      setUserAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQ.id];
        return newAnswers;
      });
    }
  };

  const goToQuestion = (questionNum: number) => {
    saveQuestionTime();
    setCurrentQuestion(questionNum);
  };

  const goToPrevious = () => {
    if (currentQuestion > 1) {
      saveQuestionTime();
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (examData && currentQuestion < examData.totalQuestions) {
      saveQuestionTime();
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const getQuestionStatus = (questionNum: number) => {
    if (!examData || !examData.questions) return "unanswered";
    const q = examData.questions[questionNum - 1];
    if (!q) return "unanswered";
    if (questionNum === currentQuestion) return "current";
    if (flaggedQuestions.has(questionNum)) return "flagged";
    if (userAnswers[q.id]) return "answered";
    return "unanswered";
  };

  const submitExam = async (
    autoSubmitted = false,
    redirectTo?: string,
  ): Promise<void> => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Immediately allow navigation when submit is called
    setAllowNavigation(true);

    // Only show loading state when not auto-submitting (i.e., when using the submit button)
    if (!autoSubmitted) {
      setSubmitting(true);
    }

    saveQuestionTime();

    const currentAnswers = latestAnswersRef.current;
    const currentTimeLeft = latestTimeLeftRef.current;
    const currentExam = latestExamDataRef.current;

    if (!currentExam) {
      submittingRef.current = false;
      return;
    }

    let totalTimeTaken = 0;

    if (currentExam.examType === "live") {
      totalTimeTaken = Math.floor((Date.now() - examStartRef.current) / 1000);
    } else {
      totalTimeTaken = currentExam.duration * 60 - currentTimeLeft;
    }

    const payload = {
      examId,
      attemptId,
      answers: currentAnswers,
      questionTimes: questionTimeMap.current,
      totalTimeTaken,
      examType: currentExam.examType,
      autoSubmitted,
    };

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch("/api/students/exams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 🔍 DEBUG LOGS (VERY IMPORTANT)
      console.log("Submit Exam API status:", res.status);
      console.log("Submit Exam API response:", data);
      console.log("Submit payload:", payload);

      // ❌ Stop if backend failed
      if (!res.ok || !data?.success) {
        submittingRef.current = false;

        // Only hide loading state when not auto-submitting
        if (!autoSubmitted) {
          setSubmitting(false);
        }
        return;
      }

      // Clear saved data from sessionStorage
      sessionStorage.removeItem(`exam_${examId}_userAnswers`);
      sessionStorage.removeItem(`exam_${examId}_questionTimes`);

      // Stop loader BEFORE redirect
      if (!autoSubmitted) {
        setSubmitting(false);
      }

      // Allow navigation
      setAllowNavigation(true);

      // Redirect
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(`/student-pages/exam_res_rev?attemptId=${attemptId}`);
      }
    } catch (err) {
      console.error("Submit Exam error:", err);
      submittingRef.current = false;

      // Only hide loading state when not auto-submitting
      if (!autoSubmitted) {
        setSubmitting(false);
      }
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = getCurrentQuestion();

  if (loading) {
    return (
      <div className={`${styles.examContainer} ${styles.containerFull}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className={`${styles.examContainer} ${styles.containerFull}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <p>{error || "Exam not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LiveExamWarningModal
        open={showLiveWarning}
        violationCount={violationCount}
        onClose={() => setShowLiveWarning(false)}
        resultDisplayTime={resultDisplayTime}
      />
      <LateEntryModal
        open={showLateEntryModal}
        delayMinutes={lateEntryMinutes}
        delaySeconds={lateEntrySeconds}
        onClose={() => setShowLateEntryModal(false)}
      />
      <LeaveExamModal
        open={showLeaveModal}
        onConfirm={() => {
          setShowLeaveModal(false);
          submitExam(true, pendingNavigation);
        }}
        onCancel={() => {
          setShowLeaveModal(false);
          setPendingNavigation(undefined);
        }}
      />
      <FullscreenExitModal
        open={showFullscreenExitModal}
        onConfirm={() => {
          setShowFullscreenExitModal(false);
          enterFullscreen();
        }}
        onCancel={() => {
          setShowFullscreenExitModal(false);
          submitExam(true);
        }}
      />

      <div className={`${styles.examContainer} ${styles.containerFull}`}>
        {/* Exam Header */}
        <div className={styles.examHeader}>
          <div className={styles.examInfo}>
            <h1>{examData!.title}</h1>
            <p>
              {examData!.totalQuestions} questions • {examData!.duration}{" "}
              minutes • {examData!.points || 200} points
            </p>
          </div>
          <div className={`${styles.timer} ${getTimerClass()}`}>
            <i className="fas fa-clock"></i> <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className={styles.examContent}>
          {/* Question Navigator Sidebar */}
          <div
            className={`${styles.questionSidebar} ${
              showNavigator ? "" : styles.compact
            } ${isDesktop ? styles.questionSidebarDesktop : ""}`}
          >
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Question Navigator</h3>
              {!isDesktop && (
                <button
                  className={`${styles.btn} ${styles.btnClose}`}
                  onClick={() => setShowNavigator(false)}
                  aria-label="Close Navigator"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            <div className={styles.questionGrid}>
              {Array.from(
                { length: examData?.totalQuestions || 0 },
                (_, i) => i + 1,
              ).map((num) => {
                const status = getQuestionStatus(num);
                return (
                  <button
                    key={num}
                    className={`${styles.questionNumber} ${styles[status]}`}
                    onClick={() => goToQuestion(num)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToQuestion(num);
                      }
                    }}
                    type="button"
                    aria-label={`Go to question ${num}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className={styles.questionStatus}>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusColor} ${styles.statusCurrent}`}
                ></div>
                <span>Current</span>
              </div>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusColor} ${styles.statusAnswered}`}
                ></div>
                <span>Answered</span>
              </div>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusColor} ${styles.statusFlagged}`}
                ></div>
                <span>Flagged</span>
              </div>
              <div className={styles.statusItem}>
                <div
                  className={`${styles.statusColor} ${styles.statusUnanswered}`}
                ></div>
                <span>Unanswered</span>
              </div>
            </div>

            <div className={styles.examNotes}>
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className={styles.instructionsList}>
                <li>Select only one answer for each question.</li>
                <li>You may flag questions for review before submitting.</li>
                <li>
                  The exam will be automatically submitted when the timer
                  expires.
                </li>
                <li>
                  Do not switch to another tab or window during the exam; doing
                  so will result in automatic submission.
                </li>
                <li>Once submitted, you cannot return to the exam.</li>
              </ul>
            </div>
          </div>

          {/* Main Question Area */}
          <div className={styles.questionMain}>
            <div className={styles.questionContainer}>
              <div className={styles.questionHeader}>
                <h2 className={styles.questionTitle}>
                  Question {currentQuestion} of {examData!.totalQuestions}
                </h2>
                <div className={styles.questionActions}>
                  {!isDesktop && (
                    <button
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => setShowNavigator(!showNavigator)}
                    >
                      <i className="fas fa-list"></i>{" "}
                      {showNavigator ? "Hide Navigator" : "Show Navigator"}
                    </button>
                  )}
                  <button
                    className={`${styles.btn} ${styles.btnFlag} ${
                      flaggedQuestions.has(currentQuestion)
                        ? styles.flagged
                        : ""
                    }`}
                    onClick={toggleFlag}
                  >
                    <i className="fas fa-flag"></i>{" "}
                    {flaggedQuestions.has(currentQuestion)
                      ? "Remove Flag"
                      : "Flag for Review"}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnClear}`}
                    onClick={clearAnswer}
                    disabled={currentQ ? !userAnswers[currentQ.id] : true}
                  >
                    <i className="fas fa-trash-alt"></i> Clear Answer
                  </button>
                </div>
              </div>

              <div className={styles.questionContent}>
                {currentQ ? (
                  <>
                    <div
                      className={styles.questionText}
                      style={{ whiteSpace: "pre-wrap",fontWeight: 600}}
                    >
                      {currentQ.text}
                    </div>

                    <ul
                      className={styles.optionsList}
                      aria-label="Multiple choice options"
                    >
                      {currentQ.options.map((option) => {
                        const isSelected =
                          userAnswers[currentQ.id] === option.id;
                        return (
                          <li key={option.id}>
                            <button
                              className={`${styles.optionItem} ${
                                isSelected ? styles.selected : ""
                              }`}
                              onClick={() => selectOption(option.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  selectOption(option.id);
                                }
                              }}
                              aria-label={`Select option ${option.id}: ${option.text}`}
                              type="button"
                            >
                              <div className={styles.optionMarker}>
                                {option.id}
                              </div>
                              <div
                                className={styles.optionText}
                                style={{ whiteSpace: "pre-wrap" }}
                              >
                                {option.text}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <div>No question available</div>
                )}
              </div>

              <div className={styles.examFooter}>
                <div className={styles.navButtons}>
                  <button
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnLarge}`}
                    onClick={goToPrevious}
                    disabled={currentQuestion === 1}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                    onClick={goToNext}
                    disabled={currentQuestion === examData!.totalQuestions}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div className={styles.progressText}>
                  <span>{answeredCount}</span> of {examData!.totalQuestions}{" "}
                  questions answered
                </div>

                <button
                  className={`${styles.btn} ${styles.btnDanger} ${styles.btnLarge}`}
                  onClick={() => submitExam(false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        <div
          className={`${styles.overlay} ${submitting ? styles.show : ""}`}
          id="loadingOverlay"
        >
          <div className={styles.overlayContent}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Submitting exam...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamContent;
