'use client';

import React from 'react';
import styles from './live_exam_warning_modal.module.css';

interface Props {
  open: boolean;
  violationCount: number;
  onClose?: () => void;
  resultDisplayTime?: string;
}

const LiveExamWarningModal: React.FC<Props> = ({ open, violationCount, onClose, resultDisplayTime }) => {
  if (!open) return null;

  const isFirstViolation = violationCount === 1;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⚠️ Tab Switch Violation</h2>
        {isFirstViolation ? (
          <>
            <p>
              You attempted to switch tabs or leave the exam.
              <br />
              <strong>This is your first warning.</strong>
            </p>
            <p className={styles.warningText}>
              <strong>Warning:</strong> If you try to switch tabs again, your exam will be{' '}
              <strong>automatically submitted</strong> and you will be redirected to the results page.
            </p>
            {onClose && (
              <button className={styles.closeButton} onClick={onClose}>
                I Understand, Continue Exam
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              You switched tabs again after receiving a warning.
              <br />
              <strong>This is a violation of exam rules.</strong>
            </p>
            <p>
              Your exam has been <strong>automatically submitted</strong>.
            </p>
            {resultDisplayTime && (
              <p className={styles.resultTimeText}>
                <strong>Result will be displayed at: {resultDisplayTime}</strong>
              </p>
            )}
            <p>
              Thank you for taking the exam!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveExamWarningModal;
