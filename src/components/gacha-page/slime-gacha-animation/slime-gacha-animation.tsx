import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./slime-gacha-animation.css";
import Slime1 from "../../../assets/images/gacha/slime-rotate/1.png";
import Slime2 from "../../../assets/images/gacha/slime-rotate/2.png";
import Slime3 from "../../../assets/images/gacha/slime-rotate/3.png";
import Slime4 from "../../../assets/images/gacha/slime-rotate/4.png";
import Slime5 from "../../../assets/images/gacha/slime-rotate/5.png";
import Slime6 from "../../../assets/images/gacha/slime-rotate/6.png";
import Slime7 from "../../../assets/images/gacha/slime-rotate/7.png";
import Slime8 from "../../../assets/images/gacha/slime-rotate/8.png";
import Slime9 from "../../../assets/images/gacha/slime-rotate/9.png";
import Slime10 from "../../../assets/images/gacha/slime-rotate/10.png";
import Slime11 from "../../../assets/images/gacha/slime-rotate/11.png";
import Slime12 from "../../../assets/images/gacha/slime-rotate/12.png";
import { SlimeWithTraits } from "../../../utils/types";
import { useSocket } from "../../../redux/socket/socket-context";
import { useLoginSocket } from "../../../redux/socket/login/login-context";

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

const SlimeGachaAnimation = forwardRef((_, ref) => {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const [currentSlimeShown, setCurrentSlimeShown] = useState<string>(slimes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls rise animation
  const slimeRotationInterval = useRef<NodeJS.Timeout | null>(null);

  // Start Slime Emerge Animation + Rotation
  const startSlimeAnimation = (): void => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(true); // Make slime visible

    // Start rotation after rise animation completes
    setTimeout(() => {
      let frameIndex = 0;
      if (slimeRotationInterval.current)
        clearInterval(slimeRotationInterval.current);

      slimeRotationInterval.current = setInterval(() => {
        setCurrentSlimeShown(slimes[frameIndex]);
        frameIndex = (frameIndex + 1) % slimes.length;
      }, 150);
    }, 800); // Wait for slime to fully rise before rotating
  };

  // Stop Slime Rotation
  const stopSlimeAnimation = (): void => {
    if (slimeRotationInterval.current) {
      clearInterval(slimeRotationInterval.current);
      slimeRotationInterval.current = null;
    }
    setIsAnimating(false);
  };

  // Reset Slime Animation
  const resetSlimeAnimation = () => {
    stopSlimeAnimation();
    setIsVisible(false); // Move slime back down
  };

  // Listen for Gacha Result
  useEffect(() => { // TODO: MOVE THIS TO PARENT
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
              setCurrentSlimeShown(base64Image);
              stopSlimeAnimation();
            }, 5000); // Stop 5s after receiving event
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

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    startSlimeAnimation,
    resetSlimeAnimation,
  }));

  return (
    <div className="slime-gacha-display">
      <img
        src={currentSlimeShown}
        alt="Slime Gacha Animation"
        className={`slime-gacha-image ${
          isVisible ? "slime-gacha-visible" : ""
        }`}
      />
    </div>
  );
});

export default SlimeGachaAnimation;
