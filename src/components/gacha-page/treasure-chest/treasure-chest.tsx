import "./treasure-chest.css";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import ChestOpen1 from "../../../assets/images/gacha/chest/chest-open-1.png";
import ChestOpen2 from "../../../assets/images/gacha/chest/chest-open-2.png";
import ChestOpen3 from "../../../assets/images/gacha/chest/chest-open-3.png";
import ChestOpen4 from "../../../assets/images/gacha/chest/chest-open-4.png";
import ChestOpen5 from "../../../assets/images/gacha/chest/chest-open-5.png";
import ChestOpen6 from "../../../assets/images/gacha/chest/chest-open-6.png";
import ChestOpen7 from "../../../assets/images/gacha/chest/chest-open-7.png";
import ChestOpen8 from "../../../assets/images/gacha/chest/chest-open-8.png";

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

const TreasureChest = forwardRef((_, ref) => {
  const [currentChestShown, setCurrentChestShown] = useState<string>(
    chestFrames[0]
  );
  const chestAnimationInterval = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Reference for fireworks

  // Play chest animation
  const playChestAnimation = async (): Promise<void> => {
    return new Promise((resolve) => {
      let frameIndex = 0;

      chestAnimationInterval.current = setInterval(() => {
        setCurrentChestShown(chestFrames[frameIndex]); // Show current chest frame
        frameIndex++;

        if (frameIndex === chestFrames.length) {
          clearInterval(chestAnimationInterval.current as NodeJS.Timeout); // Animation complete

          // Trigger fireworks AFTER chest animation completes
          fireworks();

          resolve(); // Notify that chest animation is done
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

  const fireworks = () => {
    let numBubbles = 200; // Number of bubbles

    for (let i = 0; i < numBubbles; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble-firework");

      // Random position offset
      let targetX = Math.random() * 300 - 150; // -150px to 150px
      let targetY = Math.random() * 200 - 100; // -100px to 100px

      // Randomize color and size
      const colors = ["#b0b0b0", "#8fbf71", "#5b9eea", "#ba78f9", "#f6b74c"];
      const size = 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      bubble.style.setProperty("--random-x", `${targetX}px`);
      bubble.style.setProperty("--random-y", `${targetY}px`);
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.backgroundColor = color;

      if (containerRef.current) {
        containerRef.current.appendChild(bubble);

        // Ensure bubbles disappear after animation
        setTimeout(() => {
          bubble.remove();
        }, 1000); // Same as animation duration
      }
    }
  };

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    playChestAnimation,
    resetChestAnimation,
  }));

  return (
    <div className="chest-display" ref={containerRef}>
      <img
        src={currentChestShown}
        alt="Chest Animation"
        className="chest-image"
      />
    </div>
  );
});

export default TreasureChest;
