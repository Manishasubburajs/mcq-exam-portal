'use client';

import React from 'react';
import styles from './result_time_modal.module.css';

interface Props {
  open: boolean;
  resultDisplayTime: string;
  onClose: () => void;
}

const ResultTimeModal: React.FC<Props> = ({ open, resultDisplayTime, onClose }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>✅ Exam Submitted Successfully</h2>
        <p>
          Your exam has been submitted successfully.
        </p>
        <p className={styles.infoText}>
          <strong>Result will be displayed at: {resultDisplayTime}</strong>
        </p>
        <button className={styles.closeButton} onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default ResultTimeModal;
