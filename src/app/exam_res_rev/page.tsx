'use client';

import React from 'react';
import ExamResultsReview from '../components/ExamResultsReview';

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Exam Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '5px' }}>Mathematics Midterm Exam - Results</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Completed • 30 questions • 100 points</p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '18px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center'
        }}>
          <i className="fas fa-trophy" style={{ marginRight: '8px' }}></i> <span>92%</span>
        </div>
      </div>

      <ExamResultsReview />
    </div>
  );
}