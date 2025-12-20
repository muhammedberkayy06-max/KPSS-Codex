import React from 'react';

type ProgressBarProps = {
  value: number;
  label?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => (
  <div className="progress">
    <div className="progress-info">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default ProgressBar;
