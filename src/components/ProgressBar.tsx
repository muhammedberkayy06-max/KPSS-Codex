import React from 'react';

type ProgressBarProps = {
  value: number;
  label?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => (
  <div className="bg-ios-bg shadow-ios-soft rounded-xl p-4">
    <div className="flex items-center justify-between mb-2 text-ios-subtitle text-ios-muted">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 rounded-xl bg-ios-track overflow-hidden">
      <div className="h-full bg-ios-primary transition-ios" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default ProgressBar;
