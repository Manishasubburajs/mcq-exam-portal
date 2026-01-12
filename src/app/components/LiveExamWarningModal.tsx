'use client';

import React from 'react';
import styles from './live_exam_warning_modal.module.css';

interface Props {
  open: boolean;
}

const LiveExamWarningModal: React.FC<Props> = ({ open }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⚠️ Live Exam Violation</h2>
        <p>
          You attempted to switch tabs or leave the exam.
          <br />
          <strong>This is not allowed in a LIVE exam.</strong>
        </p>
        <p>
          Your exam is being <strong>automatically submitted</strong>.
        </p>
      </div>
    </div>
  );
};

export default LiveExamWarningModal;
