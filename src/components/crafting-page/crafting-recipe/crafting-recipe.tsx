import { CraftingStatus } from "../../../redux/socket/idle/idle-context";
import { useSocket } from "../../../redux/socket/socket-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import "./crafting-recipe.css";
import { useState, useEffect } from "react";

interface CraftingRecipeProps {
  equipmentId: number;
  equipmentName: string;
  durationS: number;
  requiredItems: {
    itemId: number;
    itemName: string;
    quantity: number;
  }[];
  craftingStatus: CraftingStatus | null; // New prop to track crafting start time
}

function CraftingRecipe(props: CraftingRecipeProps) {
  const { userData } = useUserSocket();
  const { socket } = useSocket();
  const [isCraftable, setIsCraftable] = useState(false);
  const [isCrafting, setIsCrafting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCraftButton = () => {
    if (socket) {
      if (isCrafting) {
        socket.emit("stop-craft-equipment", props.equipmentId);
      } else {
        console.log(
          `Emitting socket event for craft-equipment: ${props.equipmentName}`
        );
        socket.emit("craft-equipment", props.equipmentId);
      }
    }
  };

  useEffect(() => {
    if (props.craftingStatus === null) {
      setIsCrafting(false);
    } else {
      setIsCrafting(true);
    }
  }, [props.craftingStatus]);

  useEffect(() => {
    // Check if user has all necessary items in sufficient quantity
    const canCraft = props.requiredItems.every((requiredItem) => {
      const userItem = userData.itemInventory.find(
        (item) => item.itemId === requiredItem.itemId
      );
      return userItem && userItem.quantity >= requiredItem.quantity;
    });

    setIsCraftable(canCraft);
  }, [props.requiredItems, userData.itemInventory]);

  useEffect(() => {
    if (props.craftingStatus !== null) {
      const totalDuration = props.craftingStatus.durationS * 1000; // Total crafting duration in ms
      const startTime = props.craftingStatus.startTimestamp; // Start timestamp
      const endTime = startTime + totalDuration; // End timestamp

      const updateProgress = () => {
        const currentTime = Date.now(); // Dynamically calculate the current time
        const elapsedTime = currentTime - startTime; // Time passed since the start
        const progressPercent = Math.min(
          (elapsedTime / totalDuration) * 100,
          100
        );


        if (elapsedTime < 0) {
          setProgress(0); // If crafting hasn't started yet, set progress to 0
          return;
        }

        setProgress(progressPercent);

        if (currentTime >= endTime) {
          clearInterval(interval); // Clear interval when crafting is complete
          setProgress(100); // Ensure progress is set to 100% at the end
        }
      };

      // Skip the interval if the crafting is already complete
      if (Date.now() >= endTime) {
        setProgress(100);
        return;
      }

      // Initial progress update
      updateProgress();

      // Set interval for regular progress updates
      const interval = setInterval(updateProgress, 100);

      return () => clearInterval(interval); // Cleanup interval on unmount or craftingStatus change
    } else {
      setProgress(0); // Reset progress if craftingStatus is null
    }
  }, [props.craftingStatus]);

  return (
    <div className="crafting-recipe-container">
      <h2 className="equipment-name">
        {props.equipmentName} [{props.durationS}s]
      </h2>
      <div className="required-items">
        {props.requiredItems.map((item) => {
          const userItem = userData.itemInventory.find(
            (userItem) => userItem.itemId === item.itemId
          );
          const userQuantity = userItem ? userItem.quantity : 0;

          return (
            <div key={item.itemId} className="item">
              <span className="crafting-req-item-name">
                {item.itemName} {userQuantity}/{item.quantity}
              </span>
            </div>
          );
        })}
      </div>
      {isCrafting && (
        <div className="timer-bar">
          <div
            className="timer-bar-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      <button
        className={`craft-button ${isCrafting ? "crafting-active" : ""}`}
        disabled={!isCraftable && !isCrafting}
        onClick={handleCraftButton}
      >
        {isCrafting ? "Cancel Crafting" : "Craft"}
      </button>
    </div>
  );
}

export default CraftingRecipe;
