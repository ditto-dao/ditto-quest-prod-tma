import React, { useEffect, useState } from "react";
import "./looping-timer-bar.css";

interface LoopingTimerBarProps {
  durationS: number; // Standard duration in seconds for subsequent loops
  startTimestamp: number; // Unix timestamp in milliseconds indicating when the timer started
}

const LoopingTimerBar: React.FC<LoopingTimerBarProps> = ({
  durationS,
  startTimestamp,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTimestamp) % (durationS * 1000); // Elapsed time in ms (looping)
      const newProgress = (elapsedTime / (durationS * 1000)) * 100;

      setProgress(newProgress);
    }, 50); // Update every 50ms for smoothness

    return () => clearInterval(interval); // Cleanup on unmount
  }, [durationS, startTimestamp]);

  return (
    <div className={`looping-timer-bar`}>
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
