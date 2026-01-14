'use client';

import React from 'react';
import styles from './live_exam_warning_modal.module.css'; // Reuse the CSS

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const NavigationWarningModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>⚠️ Navigation Warning</h2>
        <p>
          You are currently writing an exam.
          <br />
          Do you want to move to another page?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            No
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationWarningModal;