import React, { useEffect, useState } from "react";
import "./looping-timer-bar.css";

interface LoopingTimerBarProps {
  durationS: number; // Duration for one full loop in seconds
  startTimestamp: number; // When the first loop started (Unix timestamp in ms)
}

const LoopingTimerBar: React.FC<LoopingTimerBarProps> = ({
  durationS,
  startTimestamp,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const durationMs = durationS * 1000; // Convert seconds to milliseconds

    const calculateProgress = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimestamp;

      // Find the current loop progress, accounting for the offset
      const progressPercentage = (elapsedTime % durationMs) / durationMs;

      return progressPercentage * 100; // Convert to percentage
    };

    // Initialize the correct progress on mount
    setProgress(calculateProgress());

    // Update progress continuously
    const interval = setInterval(() => {
      setProgress(calculateProgress());
    }, 50); // Smooth update every 50ms

    return () => clearInterval(interval);
  }, [durationS, startTimestamp]);

  return (
    <div className="looping-timer-bar">
      <div className="looping-timer-progress-bar">
        <div
          className="looping-timer-progress"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoopingTimerBar;
