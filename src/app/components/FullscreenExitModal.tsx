'use client';

import React from 'react';
import styles from './leave_exam_modal.module.css';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FullscreenExitModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⚠️ Exit Fullscreen?</h2>
        <p>
          You are trying to come out from fullscreen mode. Do you want to continue the exam?
        </p>
        <div className={styles.buttonContainer}>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            Yes (Continue Exam)
          </button>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
          >
            No (Submit Exam)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenExitModal;