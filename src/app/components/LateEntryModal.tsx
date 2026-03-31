'use client';

import React from 'react';
import styles from './late_entry_modal.module.css';

interface Props {
  open: boolean;
  delayMinutes: number;
  delaySeconds: number;
  onClose: () => void;
}

const LateEntryModal: React.FC<Props> = ({ open, delayMinutes, delaySeconds, onClose }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⏰ Late Entry</h2>
        <p>
          You are late by <strong>{delayMinutes}m {delaySeconds}s</strong>
        </p>
        <p className={styles.infoText}>
          Your exam time has been reduced accordingly. You will only get the remaining time until the exam end time.
        </p>
        <button className={styles.closeButton} onClick={onClose}>
          Continue to Exam
        </button>
      </div>
    </div>
  );
};

export default LateEntryModal;
