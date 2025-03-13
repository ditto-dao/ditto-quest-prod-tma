import "./treasure-chest.css";
import { useEffect, useRef, useState } from "react";
import ChestOpen1 from "../../../assets/images/gacha/chest/chest-open-1.png";
import ChestOpen2 from "../../../assets/images/gacha/chest/chest-open-2.png";
import ChestOpen3 from "../../../assets/images/gacha/chest/chest-open-3.png";
import ChestOpen4 from "../../../assets/images/gacha/chest/chest-open-4.png";
import ChestOpen5 from "../../../assets/images/gacha/chest/chest-open-5.png";
import ChestOpen6 from "../../../assets/images/gacha/chest/chest-open-6.png";
import ChestOpen7 from "../../../assets/images/gacha/chest/chest-open-7.png";
import ChestOpen8 from "../../../assets/images/gacha/chest/chest-open-8.png";
import { useGachaSocket } from "../../../redux/socket/gacha/gacha-context";

const chestFrames = [
  ChestOpen1,
  ChestOpen2,
  ChestOpen3,
  ChestOpen4,
  ChestOpen5,
  ChestOpen6,
  ChestOpen7,
  ChestOpen8,
];

const TreasureChest = () => {
  const { rollingSlime } = useGachaSocket();

  const [currentChestShown, setCurrentChestShown] = useState<string>(
    chestFrames[0]
  );
  const chestAnimationInterval = useRef<NodeJS.Timeout | null>(null);

  // Track if animation should play initially
  const [shouldAnimate, setShouldAnimate] = useState(!rollingSlime);

  // Play chest animation
  const playChestAnimation = async (): Promise<void> => {
    return new Promise(() => {
      let frameIndex = 0;

      chestAnimationInterval.current = setInterval(() => {
        setCurrentChestShown(chestFrames[frameIndex]); // Show current chest frame
        frameIndex++;

        if (frameIndex === chestFrames.length) {
          clearInterval(chestAnimationInterval.current as NodeJS.Timeout); // Animation complete
        }
      }, 150); // Chest frame delay
    });
  };

  // Reset chest animation back to first frame
  const resetChestAnimation = () => {
    if (chestAnimationInterval.current) {
      clearInterval(chestAnimationInterval.current); // Stop animation if running
    }
    setCurrentChestShown(chestFrames[0]); // Reset to first frame
  };

  useEffect(() => {
    if (!shouldAnimate) {
      setCurrentChestShown(chestFrames[6]);
      setShouldAnimate(true);
      return; // Skip animation if rollingSlime was already true when mounted
    }

    if (rollingSlime) {
      playChestAnimation();
    } else {
      resetChestAnimation();
    }
  }, [rollingSlime]);

  return (
    <div className="chest-display">
      <img
        src={currentChestShown}
        alt="Chest Animation"
        className="chest-image"
      />
    </div>
  );
};

export default TreasureChest;