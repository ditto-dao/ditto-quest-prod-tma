import { FarmingStatus } from "../../../redux/socket/idle/idle-context";
import { useSocket } from "../../../redux/socket/socket-context";
import "./farming-item.css";
import { useState, useEffect } from "react";

interface FarmingItemProps {
  itemId: number;
  itemName: string;
  rarity: string;
  description: string;
  durationS: number;
  farmingStatus: FarmingStatus | null;
}

function FarmingItem(props: FarmingItemProps) {
  const { socket } = useSocket();
  const [isFarming, setIsFarming] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFarmButton = () => {
    if (socket) {
      if (isFarming) {
        socket.emit("stop-farm-item", props.itemId);
      } else {
        console.log(
          `Emitting socket event for farm-item: ${props.itemId}`
        );
        socket.emit("farm-item", props.itemId);
      }
    }
  };

  useEffect(() => {
    if (props.farmingStatus === null) {
      setIsFarming(false);
    } else {
      setIsFarming(true);
    }
  }, [props.farmingStatus]);

  useEffect(() => {
    if (props.farmingStatus !== null) {
      const totalDuration = props.farmingStatus.durationS * 1000; // Total farming duration in ms
      const startTime = props.farmingStatus.startTimestamp; // Start timestamp
      const endTime = startTime + totalDuration; // End timestamp

      const updateProgress = () => {
        const currentTime = Date.now(); // Dynamically calculate the current time
        const elapsedTime = currentTime - startTime; // Time passed since the start
        const progressPercent = Math.min(
          (elapsedTime / totalDuration) * 100,
          100
        );

        if (elapsedTime < 0) {
          setProgress(0); // If farming hasn't started yet, set progress to 0
          return;
        }

        setProgress(progressPercent);

        if (currentTime >= endTime) {
          clearInterval(interval); // Clear interval when farming is complete
          setProgress(100); // Ensure progress is set to 100% at the end
        }
      };

      // Skip the interval if the farming is already complete
      if (Date.now() >= endTime) {
        setProgress(100);
        return;
      }

      // Initial progress update
      updateProgress();

      // Set interval for regular progress updates
      const interval = setInterval(updateProgress, 100);

      return () => clearInterval(interval); // Cleanup interval on unmount or farmingStatus change
    } else {
      setProgress(0); // Reset progress if farming is null
    }
  }, [props.farmingStatus]);

  return (
    <div className="farming-item-container">
      <h2 className="farm-item-name">
        {props.itemName} [{props.durationS}s]
      </h2>
      <div className="farm-item-description">
				{props.description}
      </div>
      {isFarming && (
        <div className="farm-timer-bar">
          <div
            className="farm-timer-bar-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      <button
        className={`farm-button ${isFarming ? "farming-active" : ""}`}
        onClick={handleFarmButton}
      >
        {isFarming ? "Cancel" : "Farm"}
      </button>
    </div>
  );
}

export default FarmingItem;
