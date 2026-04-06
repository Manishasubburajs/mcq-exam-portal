'use client';

import React from 'react';
import styles from './leave_exam_modal.module.css';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LeaveExamModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⚠️ Leave Exam?</h2>
        <p>
          Are you sure you want to leave the exam? If you leave, your exam will be automatically submitted.
        </p>
        <div className={styles.buttonContainer}>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            Yes (Leave Exam)
          </button>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
          >
            No (Continue Exam)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveExamModal;