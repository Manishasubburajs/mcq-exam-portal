'use client';

import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useSidebar } from '@/app/components/student_layout';
import styles from './exam_taking.module.css';

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
  examType: 'practice' | 'mock' | 'live';
  points?: number;
  proctoringEnabled?: boolean;
  autoSubmit?: boolean;
}

const ExamContent: React.FC = () => {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);

  useEffect(() => {
    if (!examId) {
      setError("No exam ID provided");
      setLoading(false);
      return;
    }

    const fetchExam = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/students/exams?id=${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setExamData(data.data);
          setTimeLeft(data.data.duration * 60);
        } else {
          setError(data.message || "Failed to load exam");
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (!examData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, timeLeft]);

  // Prevent right-click and leaving the page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('Right-click is disabled during the exam.');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 300) return styles.critical;
    if (timeLeft <= 600) return styles.warning;
    return '';
  };

  const getCurrentQuestion = () => {
    if (!examData || !examData.questions || examData.questions.length === 0) return null;
    const questionIndex = (currentQuestion - 1) % examData.questions.length;
    return examData.questions[questionIndex];
  };


  const selectOption = (optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
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
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };


  const goToQuestion = (questionNum: number) => {
    setCurrentQuestion(questionNum);
  };

  const goToPrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (examData && currentQuestion < examData.totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const getQuestionStatus = (questionNum: number) => {
    if (questionNum === currentQuestion) return 'current';
    if (userAnswers[questionNum]) return 'answered';
    if (flaggedQuestions.has(questionNum)) return 'flagged';
    return 'unanswered';
  };

  const handleSubmitExam = () => {
    const answered = Object.keys(userAnswers).length;
    alert(`Exam submitted! You answered ${answered} out of ${examData!.totalQuestions} questions.`);
    // In a real app, this would redirect to results page
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = getCurrentQuestion();

  const { sidebarOpen } = useSidebar();
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const leftPosition = isDesktop && sidebarOpen ? '220px' : '0px';

  const renderQuestionSidebar = () => (
    <div className={`${styles.questionSidebar} ${showNavigator ? '' : styles.compact} ${isDesktop ? styles.questionSidebarDesktop : ''}`}>
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
        {Array.from({ length: examData?.totalQuestions || 0 }, (_, i) => i + 1).map(num => {
          const status = getQuestionStatus(num);
          return (
            <button
              key={num}
              className={`${styles.questionNumber} ${styles[status]}`}
              onClick={() => goToQuestion(num)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
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
          <div className={`${styles.statusColor} ${styles.statusCurrent}`}></div>
          <span>Current</span>
        </div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.statusAnswered}`}></div>
          <span>Answered</span>
        </div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.statusFlagged}`}></div>
          <span>Flagged</span>
        </div>
        <div className={styles.statusItem}>
          <div className={`${styles.statusColor} ${styles.statusUnanswered}`}></div>
          <span>Unanswered</span>
        </div>
      </div>

      <div className={styles.examNotes}>
        <p><strong>Instructions:</strong></p>
        <ul className={styles.instructionsList}>
          <li>Select one answer per question</li>
          <li>You can flag questions for review</li>
          <li>Timer will auto-submit when time expires</li>
          <li>No going back after submission</li>
        </ul>
      </div>
    </div>
  );

  const renderQuestionMain = () => (
    <div className={styles.questionMain}>
      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <h2 className={styles.questionTitle}>Question {currentQuestion} of {examData!.totalQuestions}</h2>
          <div className={styles.questionActions}>
            {!isDesktop && (
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={() => setShowNavigator(!showNavigator)}
              >
                <i className="fas fa-list"></i> {showNavigator ? 'Hide Navigator' : 'Show Navigator'}
              </button>
            )}
            <button
              className={`${styles.btn} ${styles.btnFlag} ${flaggedQuestions.has(currentQuestion) ? styles.flagged : ''}`}
              onClick={toggleFlag}
            >
              <i className="fas fa-flag"></i> {flaggedQuestions.has(currentQuestion) ? 'Remove Flag' : 'Flag for Review'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnClear}`}
              onClick={clearAnswer}
              disabled={!userAnswers[currentQuestion]}
            >
              <i className="fas fa-trash-alt"></i> Clear Answer
            </button>
          </div>
        </div>

        <div className={styles.questionContent}>
          {currentQ ? (
            <>
              <div className={styles.questionText}>
                {currentQ.text}
              </div>

              <ul className={styles.optionsList} aria-label="Multiple choice options">
                {currentQ.options.map(option => {
                  const isSelected = userAnswers[currentQuestion] === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        className={`${styles.optionItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => selectOption(option.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectOption(option.id);
                          }
                        }}
                        aria-label={`Select option ${option.id}: ${option.text}`}
                        type="button"
                      >
                        <div className={styles.optionMarker}>{option.id}</div>
                        <div className={styles.optionText}>{option.text}</div>
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
            <span>{answeredCount}</span> of {examData!.totalQuestions} questions answered
          </div>

          <button
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnLarge}`}
            onClick={() => setShowSubmitModal(true)}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`${styles.examContainer} ${leftPosition === '220px' ? styles.containerShifted : styles.containerFull}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className={`${styles.examContainer} ${leftPosition === '220px' ? styles.containerShifted : styles.containerFull}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>{error || "Exam not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.examContainer} ${leftPosition === '220px' ? styles.containerShifted : styles.containerFull}`}>
      {/* Exam Header */}
      <div className={`${styles.examHeader} ${leftPosition === '220px' ? styles.left220 : styles.left0}`}>
        <div className={styles.examInfo}>
          <h1>{examData!.title}</h1>
          <p>{examData!.totalQuestions} questions • {examData!.duration} minutes • {examData!.points || 200} points</p>
        </div>
        <div className={`${styles.timer} ${getTimerClass()}`}>
          <i className="fas fa-clock"></i> <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className={styles.examContent}>
        {/* Question Navigator Sidebar */}
        {renderQuestionSidebar()}

        {/* Main Question Area */}
        {renderQuestionMain()}
      </div>

      {/* Submit Confirmation Modal */}
      <div className={`${styles.modal} ${showSubmitModal ? styles.show : ''}`} id="submitModal">
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Submit Exam?</h2>
          <p className={styles.modalText} id="modalText">
            You have answered {answeredCount} out of {examData.totalQuestions} questions. Are you sure you want to submit your exam?
          </p>
          <div className={styles.modalButtons}>
            <button className={`${styles.btn} ${styles.btnOutline}`} id="cancelSubmit" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnDanger}`} id="confirmSubmit" onClick={handleSubmitExam}>
              Yes, Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamContent;