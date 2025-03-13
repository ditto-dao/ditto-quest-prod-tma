import { useState, useEffect, useRef } from "react";
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
import { useGachaSocket } from "../../../redux/socket/gacha/gacha-context";

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

const SlimeGachaAnimation = () => {
  const { rollingSlime, slimeDrawn } = useGachaSocket();

  const [currentSlimeShown, setCurrentSlimeShown] = useState<string>(slimes[0]);
  const [isVisible, setIsVisible] = useState(false);
  const slimeRotationInterval = useRef<NodeJS.Timeout | null>(null);

  // Track if animation should play initially
  const [shouldAnimate, setShouldAnimate] = useState(!rollingSlime);

  // Start Slime Emerge Animation + Rotation
  const startSlimeAnimation = (): void => {
    if (!rollingSlime || !shouldAnimate) return;
    setIsVisible(true);

    // Start rotation after rise animation completes
    setTimeout(() => {
      let frameIndex = 0;
      if (slimeRotationInterval.current)
        clearInterval(slimeRotationInterval.current);

      slimeRotationInterval.current = setInterval(() => {
        setCurrentSlimeShown(slimes[frameIndex]);
        frameIndex = (frameIndex + 1) % slimes.length;
      }, 100);
    }, 800);
  };

  // Stop Slime Rotation
  const stopSlimeAnimation = (): void => {
    if (slimeRotationInterval.current) {
      clearInterval(slimeRotationInterval.current);
      slimeRotationInterval.current = null;
    }
  };

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(true)
      return; // Skip animation if rollingSlime was already true when mounted
    }

    if (rollingSlime) {
      setTimeout(() => {
        startSlimeAnimation();
      }, 1500);
    } else {
      setIsVisible(false);
      stopSlimeAnimation();
    }
  }, [rollingSlime]);

  useEffect(() => {
    if (!shouldAnimate) {
      setShouldAnimate(true);
      setIsVisible(true)
      if (slimeDrawn) setCurrentSlimeShown(slimeDrawn);
      return; // Skip animation if rollingSlime was already true when mounted
    }
    if (slimeDrawn) {
      setTimeout(() => {
        stopSlimeAnimation();
        setCurrentSlimeShown(slimeDrawn);
      }, 4000);
    }
  }, [slimeDrawn]);

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
};

export default SlimeGachaAnimation;
