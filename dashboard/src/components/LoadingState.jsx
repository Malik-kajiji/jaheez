import React from 'react';
import '../styles/_animations.scss';

export const LoadingState = ({ type = 'spinner', count = 3 }) => {
  if (type === 'spinner') {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="requests-grid">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-id" />
              <div className="skeleton-status" />
            </div>
            
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text" />
            </div>
            
            <div className="skeleton-footer">
              <div className="skeleton-time" />
              <div className="skeleton-actions">
                <div className="skeleton-button" />
                <div className="skeleton-button" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingState;