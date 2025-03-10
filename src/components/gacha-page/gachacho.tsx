import { useState, useEffect, useRef } from "react";
import "./gacha-page.css";
import Slime1 from "../../assets/images/gacha/slime-rotate/1.png";
import Slime2 from "../../assets/images/gacha/slime-rotate/2.png";
import Slime3 from "../../assets/images/gacha/slime-rotate/3.png";
import Slime4 from "../../assets/images/gacha/slime-rotate/4.png";
import Slime5 from "../../assets/images/gacha/slime-rotate/5.png";
import Slime6 from "../../assets/images/gacha/slime-rotate/6.png";
import Slime7 from "../../assets/images/gacha/slime-rotate/7.png";
import Slime8 from "../../assets/images/gacha/slime-rotate/8.png";
import Slime9 from "../../assets/images/gacha/slime-rotate/9.png";
import Slime10 from "../../assets/images/gacha/slime-rotate/10.png";
import Slime11 from "../../assets/images/gacha/slime-rotate/11.png";
import Slime12 from "../../assets/images/gacha/slime-rotate/12.png";
import ChestOpen1 from "../../assets/images/gacha/chest/chest-open-1.png";
import ChestOpen2 from "../../assets/images/gacha/chest/chest-open-2.png";
import ChestOpen3 from "../../assets/images/gacha/chest/chest-open-3.png";
import ChestOpen4 from "../../assets/images/gacha/chest/chest-open-4.png";
import ChestOpen5 from "../../assets/images/gacha/chest/chest-open-5.png";
import ChestOpen6 from "../../assets/images/gacha/chest/chest-open-6.png";
import ChestOpen7 from "../../assets/images/gacha/chest/chest-open-7.png";
import ChestOpen8 from "../../assets/images/gacha/chest/chest-open-8.png";
import { useSocket } from "../../redux/socket/socket-context";
import { SlimeWithTraits } from "../../utils/types";
import { useLoginSocket } from "../../redux/socket/login/login-context";

interface GachaPullRes {
  slime: SlimeWithTraits;
  rankPull: string;
  slimeNoBg: ArrayBuffer;
}

const slimes = [
  Slime1,
  Slime2,
  Slime3,
  Slime4,
  Slime5,
  Slime6,
  Slime7,
  Slime8,
  Slime9,
  Slime10,
  Slime11,
  Slime12,
];

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

function GachaPage() {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const [currentSlimeShown, setCurrentSlimeShown] = useState<string>(slimes[0]); // Slime animation
  const [currentChestShown, setCurrentChestShown] = useState<string>(
    chestFrames[0]
  ); // Chest animation
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const slimeRotationInterval = useRef<NodeJS.Timeout | null>(null);
  const chestAnimationInterval = useRef<NodeJS.Timeout | null>(null);

  // Play chest animation
  const playChestAnimation = async (): Promise<void> => {
    return new Promise((resolve) => {
      let frameIndex = 0;

      chestAnimationInterval.current = setInterval(() => {
        setCurrentChestShown(chestFrames[frameIndex]); // Show current chest frame
        frameIndex++;

        if (frameIndex === chestFrames.length) {
          clearInterval(chestAnimationInterval.current as NodeJS.Timeout); // Animation complete
          resolve(); // Notify that chest animation is done
        }
      }, 150); // Chest frame delay
    });
  };

  // Play slime rotation
  const startSlimeRotation = (): void => {
    let frameIndex = 0;

    if (slimeRotationInterval.current) {
      clearInterval(slimeRotationInterval.current);
    }

    slimeRotationInterval.current = setInterval(() => {
      setCurrentSlimeShown(slimes[frameIndex]); // Show current slime frame
      frameIndex = (frameIndex + 1) % slimes.length; // Loop through slimes
    }, 150); // Slime frame delay
  };

  const stopSlimeRotation = (): void => {
    if (slimeRotationInterval.current) {
      clearInterval(slimeRotationInterval.current);
      slimeRotationInterval.current = null;
    }
  };

  const pullGacha = async () => {
    if (isAnimationRunning) return;
    setIsAnimationRunning(true);

    await playChestAnimation(); // Wait for chest animation to finish
    startSlimeRotation(); // Start slime rotation
    if (socket && !loadingSocket && accessGranted) {
      socket.emit("mint-gen-0-slime");
    }
  };

  // Listen for slime-gacha-update event
  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      const handleSlimeGachaUpdate = (res: GachaPullRes) => {
        console.log("Gacha response:", res);

        try {
          if (res.slimeNoBg instanceof ArrayBuffer) {
            const binary = new Uint8Array(res.slimeNoBg).reduce(
              (acc, byte) => acc + String.fromCharCode(byte),
              ""
            );
            const base64Image = `data:image/png;base64,${btoa(binary)}`;

            setTimeout(() => {
              setCurrentSlimeShown(base64Image); // Use the Base64 string as the slime image source
              stopSlimeRotation();
              setIsAnimationRunning(false);
            }, 3000);
          } else {
            console.error("Invalid ArrayBuffer received:", res.slimeNoBg);
          }
        } catch (error) {
          console.error("Error converting ArrayBuffer to Base64:", error);
        }
      };

      socket.on("slime-gacha-update", handleSlimeGachaUpdate);

      return () => {
        socket.off("slime-gacha-update", handleSlimeGachaUpdate);
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  return (
    <div className="gacha-page-container">
      <div className="animation-div">
        <div className="chest-display">
          <img
            src={currentChestShown}
            alt="Chest Animation"
            className="chest-image"
          />
        </div>
        <div className="slime-display">
          <img
            src={currentSlimeShown}
            alt="Slime Animation"
            className="slime-image"
          />
        </div>
      </div>
      <button
        onClick={pullGacha}
        className="rotate-button"
        disabled={isAnimationRunning}
      >
        Slime Gacha
      </button>
    </div>
  );
}

export default GachaPage;
