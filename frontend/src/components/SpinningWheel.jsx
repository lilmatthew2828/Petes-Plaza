import React from 'react';
import './SpinningWheel.css';

const SpinningWheel = ({ progress = 0 }) => {
  // SVG Math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate how much of the rope to "hide"
  // When progress is 0, offset is 565.48 (full circle hidden)
  // When progress is 100, offset is 0 (full circle shown)
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="pete-loader-wrapper">
      <svg 
        viewBox="0 0 200 200" 
        className="pete-svg"
      >
        {/* Background "Empty" Rope (Dark Grey) */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="rope-bg"
        />

        {/* The Animated "Gold" Rope */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="rope-progress"
          style={{ 
            strokeDasharray: circumference,
            strokeDashoffset: offset 
          }}
          transform="rotate(-90 100 100)"
        />

        {/* The Logo Image */}
        {/* Note: x and y are adjusted to center the image within the rope */}
        <image 
          href="/assets/pete-logo.png" 
          x="25" 
          y="25" 
          width="150" 
          height="150" 
        />
      </svg>
      
      {/* Percentage Text (Optional) */}
      <div className="loading-text">
        {progress < 100 ? `Scouring the seas... ${progress}%` : "Land ho!"}
      </div>
    </div>
  );
};

export default SpinningWheel;