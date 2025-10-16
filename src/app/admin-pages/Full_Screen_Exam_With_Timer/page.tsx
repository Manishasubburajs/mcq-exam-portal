'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

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

const FullScreenExamWithTimer: React.FC = () => {
  // Exam data
  const examData: ExamData = {
    title: "Mathematics Final Examination",
    duration: 120, // minutes
    totalQuestions: 50,
    questions: [
      {
        id: 1,
        text: "What is the value of the derivative of f(x) = 3x² + 2x - 5 at x = 2?",
        options: [
          { id: 'A', text: "10" },
          { id: 'B', text: "12" },
          { id: 'C', text: "14" },
          { id: 'D', text: "16" }
        ],
        correctAnswer: 'C'
      },
      {
        id: 2,
        text: "Solve for x: 2x + 5 = 3x - 7",
        options: [
          { id: 'A', text: "5" },
          { id: 'B', text: "12" },
          { id: 'C', text: "-12" },
          { id: 'D', text: "-5" }
        ],
        correctAnswer: 'B'
      },
      {
        id: 3,
        text: "What is the area of a circle with a radius of 7 units?",
        options: [
          { id: 'A', text: "49π" },
          { id: 'B', text: "14π" },
          { id: 'C', text: "28π" },
          { id: 'D', text: "98π" }
        ],
        correctAnswer: 'A'
      },
      {
        id: 4,
        text: "Which of the following is a prime number?",
        options: [
          { id: 'A', text: "1" },
          { id: 'B', text: "15" },
          { id: 'C', text: "23" },
          { id: 'D', text: "27" }
        ],
        correctAnswer: 'C'
      },
      {
        id: 5,
        text: "What is the solution to the equation 2x² - 8x + 6 = 0?",
        options: [
          { id: 'A', text: "x = 1, x = 3" },
          { id: 'B', text: "x = 2, x = 4" },
          { id: 'C', text: "x = -1, x = -3" },
          { id: 'D', text: "x = -2, x = -4" }
        ],
        correctAnswer: 'A'
      }
    ]
  };

  // State management
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(examData.duration * 60); // Convert to seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen functionality
  const requestFullScreen = useCallback(() => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  }, []);

  const checkFullScreen = useCallback(() => {
    const fullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    setIsFullScreen(fullscreen);
    setShowFullscreenWarning(!fullscreen);
  }, []);

  // Timer functionality
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => checkFullScreen();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [checkFullScreen]);

  // Prevent right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('Right-click is disabled during the exam.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        alert('This function is disabled during the exam.');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFullScreen) return;
      e.preventDefault();
      e.returnValue = '';
      return 'Are you sure you want to leave? Your exam progress may be lost.';
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFullScreen]);

  // Helper functions
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = (): Question => {
    const questionIndex = (currentQuestion - 1) % examData.questions.length;
    return examData.questions[questionIndex];
  };

  const getQuestionStatus = (questionNum: number): 'current' | 'answered' | 'flagged' | 'unanswered' => {
    if (questionNum === currentQuestion) return 'current';
    if (userAnswers[questionNum]) return 'answered';
    if (flaggedQuestions.has(questionNum)) return 'flagged';
    return 'unanswered';
  };

  // Event handlers
  const handleSelectOption = (optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
  };

  const handleToggleFlag = () => {
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

  const handleGoToQuestion = (questionNum: number) => {
    setCurrentQuestion(questionNum);
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < examData.totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmitExam = () => {
    const answered = Object.keys(userAnswers).length;
    alert(`Exam submitted! You answered ${answered} questions.`);
    // In a real app, this would redirect to results page
  };

  const handleClearAnswer = () => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = getCurrentQuestion();

  return (
    <>
      {/* Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-color: #f5f7fa;
          color: #333;
          overflow: hidden;
        }

        /* Exam Header */
        .exam-header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 15px 20px 15px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          height: 70px;
        }

        .exam-info {
          text-align: left;
          padding-left: 0;
        }

        .exam-info h1 {
          font-size: 22px;
          margin-bottom: 5px;
        }

        .exam-info p {
          font-size: 14px;
          opacity: 0.9;
        }

        .timer {
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: all 0.3s;
        }

        .timer i {
          margin-right: 8px;
        }

        .timer.warning {
          background: rgba(255, 193, 7, 0.3);
          color: #ffc107;
          animation: pulse 1s infinite;
        }

        .timer.critical {
          background: rgba(220, 53, 69, 0.3);
          color: #dc3545;
          animation: pulse 0.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* Main Exam Container */
        .exam-container {
          display: flex;
          height: 100vh;
          padding-top: 70px;
        }

        /* Question Navigator */
        .question-sidebar {
          width: 265px;
          background: #f8f9fa;
          border-right: 1px solid #e0e0e0;
          padding: 17px;
          overflow-y: auto;
          height: 100%;
        }

        .sidebar-title {
          font-size: 18px;
          margin-bottom: 15px;
          color: #2c3e50;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
          text-align: left;
        }

        .question-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 9px;
          margin-bottom: 18px;
        }

        .question-number {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #ddd;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 13px;
        }

        .question-number:hover {
          border-color: #6a11cb;
          color: #6a11cb;
        }

        .question-number.current {
          background: #6a11cb;
          border-color: #6a11cb;
          color: white;
        }

        .question-number.answered {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }

        .question-number.flagged {
          background: #ffc107;
          border-color: #ffc107;
          color: white;
        }

        .question-status {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .status-item {
          display: flex;
          align-items: center;
          font-size: 14px;
        }

        .status-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
          margin-right: 5px;
        }

        .status-current {
          background: #6a11cb;
        }

        .status-answered {
          background: #28a745;
        }

        .status-flagged {
          background: #ffc107;
        }

        .status-unanswered {
          background: #ddd;
        }

        .exam-notes {
          font-size: 14px;
          color: #7f8c8d;
          margin-top: 20px;
        }

        .exam-notes p {
          margin-bottom: 10px;
        }

        .exam-notes ul {
          margin-top: 10px;
          padding-left: 20px;
        }

        .exam-notes li {
          margin-bottom: 5px;
        }

        /* Question Area */
        .question-main {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          height: 100%;
          background: white;
        }

        .question-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .question-title {
          font-size: 20px;
          color: #2c3e50;
        }

        .question-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #2575fc;
          color: #2575fc;
        }

        .btn-outline:hover {
          background: #f0f5ff;
        }

        .btn-flag {
          background: #ffc107;
          color: white;
        }

        .btn-flag:hover {
          background: #e0a800;
        }

        .btn-flag.flagged {
          background: #dc3545;
        }

        .btn-clear {
          background: #6c757d;
          color: white;
        }

        .btn-clear:hover {
          background: #5a6268;
        }

        .question-content {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
        }

        .question-text {
          font-size: 18px;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .options-list {
          list-style: none;
        }

        .option-item {
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .option-item:hover {
          border-color: #6a11cb;
          background: #f8f7ff;
        }

        .option-item.selected {
          border-color: #2575fc;
          background: #e8f0fe;
        }

        .option-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .option-text {
          flex: 1;
        }

        /* Navigation Footer */
        .exam-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
          margin-top: 30px;
        }

        .nav-buttons {
          display: flex;
          gap: 15px;
        }

        .btn-large {
          padding: 12px 25px;
          font-size: 16px;
        }

        .btn-primary {
          background: linear-gradient(to right, #6a11cb, #2575fc);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .progress-text {
          color: #7f8c8d;
          font-size: 14px;
        }

        /* Modal for submission */
        .modal {
          display: ${showSubmitModal ? 'flex' : 'none'};
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .modal-title {
          font-size: 24px;
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .modal-text {
          margin-bottom: 25px;
          color: #7f8c8d;
        }

        .modal-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        /* Full screen warning */
        .fullscreen-warning {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          display: ${showFullscreenWarning ? 'flex' : 'none'};
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          text-align: center;
          padding: 20px;
        }

        .fullscreen-warning h2 {
          font-size: 28px;
          margin-bottom: 20px;
          color: #ff6b6b;
        }

        .fullscreen-warning p {
          font-size: 18px;
          margin-bottom: 30px;
          max-width: 600px;
        }

        .fullscreen-btn {
          background: #2575fc;
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .fullscreen-btn:hover {
          background: #1c68e0;
          transform: scale(1.05);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .exam-container {
            flex-direction: column;
          }

          .question-sidebar {
            width: 100%;
            height: auto;
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }

          .question-main {
            height: calc(100vh - 270px);
          }
        }

        @media (max-width: 768px) {
          .exam-header {
            flex-direction: column;
            text-align: center;
            padding: 15px;
            height: auto;
          }

          .exam-info {
            margin-bottom: 10px;
          }

          .question-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .question-actions {
            margin-top: 10px;
            flex-direction: column;
            align-items: flex-start;
          }

          .question-actions .btn {
            margin-bottom: 8px;
            width: 100%;
          }

          .exam-footer {
            flex-direction: column;
            gap: 15px;
          }

          .nav-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .modal-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Full Screen Warning */}
      <div className="fullscreen-warning" id="fullscreenWarning">
        <h2>Full Screen Required</h2>
        <p>This exam must be taken in full screen mode to ensure exam integrity. Please enable full screen to continue.</p>
        <button className="fullscreen-btn" onClick={requestFullScreen}>Enable Full Screen</button>
      </div>

      {/* Exam Header */}
      <div className="exam-header">
        <div className="exam-info">
          <h1>{examData.title}</h1>
          <p>{examData.totalQuestions} questions • {examData.duration} minutes • 200 points</p>
        </div>
        <div className={`timer ${timeLeft <= 300 ? 'critical' : timeLeft <= 600 ? 'warning' : ''}`}>
          <i className="fas fa-clock"></i> <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="exam-container">
        {/* Question Navigator Sidebar */}
        <div className="question-sidebar">
          <h3 className="sidebar-title">Question Navigator</h3>

          <div className="question-grid" id="questionGrid">
            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
              const status = getQuestionStatus(num);
              return (
                <div
                  key={num}
                  className={`question-number ${status}`}
                  onClick={() => handleGoToQuestion(num)}
                >
                  {num}
                </div>
              );
            })}
          </div>

          <div className="question-status">
            <div className="status-item">
              <div className="status-color status-current"></div>
              <span>Current</span>
            </div>
            <div className="status-item">
              <div className="status-color status-answered"></div>
              <span>Answered</span>
            </div>
            <div className="status-item">
              <div className="status-color status-flagged"></div>
              <span>Flagged</span>
            </div>
            <div className="status-item">
              <div className="status-color status-unanswered"></div>
              <span>Unanswered</span>
            </div>
          </div>

          <div className="exam-notes">
            <p><strong>Instructions:</strong></p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>Select one answer per question</li>
              <li>You can flag questions for review</li>
              <li>Timer will auto-submit when time expires</li>
              <li>No going back after submission</li>
            </ul>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="question-main">
          <div className="question-container">
            <div className="question-header">
              <h2 className="question-title">Question {currentQuestion} of {examData.totalQuestions}</h2>
              <div className="question-actions">
                <button
                  className={`btn btn-flag ${flaggedQuestions.has(currentQuestion) ? 'flagged' : ''}`}
                  onClick={handleToggleFlag}
                >
                  <i className="fas fa-flag"></i> {flaggedQuestions.has(currentQuestion) ? 'Remove Flag' : 'Flag for Review'}
                </button>
                <button
                  className="btn btn-clear"
                  onClick={handleClearAnswer}
                  disabled={!userAnswers[currentQuestion]}
                  style={{ opacity: userAnswers[currentQuestion] ? 1 : 0.5 }}
                >
                  <i className="fas fa-trash-alt"></i> Clear Answer
                </button>
              </div>
            </div>

            <div className="question-content">
              <div className="question-text">
                {currentQ.text}
              </div>

              <ul className="options-list">
                {currentQ.options.map(option => (
                  <li
                    key={option.id}
                    className={`option-item ${userAnswers[currentQuestion] === option.id ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <div className="option-marker">{option.id}</div>
                    <div className="option-text">{option.text}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="exam-footer">
              <div className="nav-buttons">
                <button
                  className="btn btn-outline btn-large"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 1}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleNext}
                  disabled={currentQuestion === examData.totalQuestions}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              <div className="progress-text">
                {answeredCount} of {examData.totalQuestions} questions answered
              </div>

              <button className="btn btn-danger btn-large" onClick={() => setShowSubmitModal(true)}>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <div className="modal">
        <div className="modal-content">
          <h2 className="modal-title">Submit Exam?</h2>
          <p className="modal-text">
            You have answered {answeredCount} out of {examData.totalQuestions} questions. Are you sure you want to submit your exam?
          </p>
          <div className="modal-buttons">
            <button className="btn btn-outline" onClick={() => setShowSubmitModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSubmitExam}>Yes, Submit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullScreenExamWithTimer;