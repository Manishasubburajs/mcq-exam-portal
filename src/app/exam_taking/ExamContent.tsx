'use client';

import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
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
}

const ExamContent: React.FC = () => {
  // Mock exam data
  const examData: ExamData = {
    title: "Mathematics Midterm Exam",
    duration: 45,
    totalQuestions: 30,
    questions: [
      {
        id: 1,
        text: "What is the value of π (pi) to two decimal places?",
        options: [
          { id: 'A', text: "3.14" },
          { id: 'B', text: "3.15" },
          { id: 'C', text: "3.16" },
          { id: 'D', text: "3.18" }
        ],
        correctAnswer: 'A'
      },
      {
        id: 2,
        text: "Solve for x: 2x + 5 = 15",
        options: [
          { id: 'A', text: "5" },
          { id: 'B', text: "10" },
          { id: 'C', text: "7.5" },
          { id: 'D', text: "5.5" }
        ],
        correctAnswer: 'A'
      },
      {
        id: 3,
        text: "What is the derivative of x²?",
        options: [
          { id: 'A', text: "x" },
          { id: 'B', text: "2x" },
          { id: 'C', text: "2" },
          { id: 'D', text: "x²" }
        ],
        correctAnswer: 'B'
      },
      {
        id: 4,
        text: "What is the integral of 2x dx?",
        options: [
          { id: 'A', text: "x²" },
          { id: 'B', text: "x² + C" },
          { id: 'C', text: "2x²" },
          { id: 'D', text: "2x² + C" }
        ],
        correctAnswer: 'B'
      },
      {
        id: 5,
        text: "Which of the following is a prime number?",
        options: [
          { id: 'A', text: "1" },
          { id: 'B', text: "9" },
          { id: 'C', text: "15" },
          { id: 'D', text: "17" }
        ],
        correctAnswer: 'D'
      }
    ]
  };

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(examData.duration * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer effect
  useEffect(() => {
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

  const goToQuestion = (questionNum: number) => {
    setCurrentQuestion(questionNum);
  };

  const goToPrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion < examData.totalQuestions) {
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
    alert(`Exam submitted! You answered ${answered} out of ${examData.totalQuestions} questions.`);
    // In a real app, this would redirect to results page
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = getCurrentQuestion();

  return (
    <div className={styles.examContainer}>
      {/* Exam Header */}
      <div className={styles.examHeader}>
        <div className={styles.examInfo}>
          <h1>{examData.title}</h1>
          <p>{examData.duration} minutes • {examData.totalQuestions} questions • 100 points</p>
        </div>
        <div className={`${styles.timer} ${getTimerClass()}`}>
          <i className="fas fa-clock"></i> <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className={styles.examContent}>
        {/* Question Navigator Sidebar */}
        <div className={styles.questionSidebar}>
          <h3 className={styles.sidebarTitle}>Question Navigator</h3>

          <div className={styles.questionGrid}>
            {Array.from({ length: examData.totalQuestions }, (_, i) => i + 1).map(num => (
              <div
                key={num}
                className={`${styles.questionNumber} ${styles[getQuestionStatus(num)]}`}
                onClick={() => goToQuestion(num)}
              >
                {num}
              </div>
            ))}
          </div>

          <div className={styles.questionStatus}>
            <div className={styles.statusItem}>
              <div className={styles.statusColor + ' ' + styles.statusCurrent}></div>
              <span>Current</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusColor + ' ' + styles.statusAnswered}></div>
              <span>Answered</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusColor + ' ' + styles.statusFlagged}></div>
              <span>Flagged</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusColor + ' ' + styles.statusUnanswered}></div>
              <span>Unanswered</span>
            </div>
          </div>

          <div className={styles.examNotes}>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Select one answer per question</li>
              <li>You can flag questions for review</li>
              <li>Timer will auto-submit when time expires</li>
              <li>No going back after submission</li>
            </ul>
          </div>
        </div>

        {/* Main Question Area */}
        <div className={styles.questionMain}>
          <div className={styles.questionContainer}>
            <div className={styles.questionHeader}>
              <h2 className={styles.questionTitle}>Question {currentQuestion} of {examData.totalQuestions}</h2>
              <div className={styles.questionActions}>
                <button
                  className={`${styles.btn} ${styles.btnFlag} ${flaggedQuestions.has(currentQuestion) ? styles.flagged : ''}`}
                  onClick={toggleFlag}
                >
                  <i className="fas fa-flag"></i> {flaggedQuestions.has(currentQuestion) ? 'Unflag' : 'Flag'}
                </button>
              </div>
            </div>

            <div className={styles.questionContent}>
              <div className={styles.questionText}>
                {currentQ.text}
              </div>

              <ul className={styles.optionsList}>
                {currentQ.options.map(option => (
                  <li
                    key={option.id}
                    className={`${styles.optionItem} ${userAnswers[currentQuestion] === option.id ? styles.selected : ''}`}
                    onClick={() => selectOption(option.id)}
                  >
                    <div className={styles.optionMarker}>{option.id}</div>
                    <div className={styles.optionText}>{option.text}</div>
                  </li>
                ))}
              </ul>
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
                  disabled={currentQuestion === examData.totalQuestions}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              <div className={styles.progressText}>
                <span>{answeredCount}</span> of {examData.totalQuestions} questions answered
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
      </div>

      {/* Submit Confirmation Modal */}
      <Dialog
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            You have answered {answeredCount} out of {examData.totalQuestions} questions. Are you sure you want to submit your exam?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button onClick={handleSubmitExam} variant="contained" color="error">
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExamContent;