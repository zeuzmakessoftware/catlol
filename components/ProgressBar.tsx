import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: string;
  backgroundColor?: string;
  fillColor?: string;
  onComplete?: () => void;
}

const ProgressBar = ({ 
  percentage, 
  height = '24px',
  backgroundColor = '#2F4F4F20',
  fillColor = 'linear-gradient(90deg, #4CAF50, #81C784)',
  onComplete
}: ProgressBarProps) => {
  const prevPercentage = useRef(percentage);

  useEffect(() => {
    if (percentage >= 100 && prevPercentage.current < 100 && onComplete) {
      onComplete();
    }
    prevPercentage.current = percentage;
  }, [percentage, onComplete]);

  return (
    <div className="relative">
      {/* First Checkpoint */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 
                   bg-green-100 rounded-full border-2 border-green-500 z-10"
        style={{
          boxShadow: percentage >= 50 ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
          backgroundColor: percentage >= 50 ? '#4CAF50' : '#f0f0f0'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {percentage >= 50 ? '🐱' : '😺'}
        </div>
      </div>
      <div 
        className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-8 
                   bg-green-100 rounded-full border-2 border-green-500 z-10"
        style={{
          boxShadow: percentage >= 100 ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
          backgroundColor: percentage >= 100 ? '#4CAF50' : '#f0f0f0'
        }}
      >
        {percentage >= 100 && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            🐱
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height,
          width: '100%',
          backgroundColor,
          borderRadius: '999px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '2px solid #4CAF5040'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            background: fillColor,
            transition: 'width 0.5s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
