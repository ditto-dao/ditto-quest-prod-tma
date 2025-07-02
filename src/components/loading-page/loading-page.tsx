import "./loading-page.css";
import LoadingSprite from "../../assets/images/general/dq-logo.png";
import { motion } from "framer-motion";
import FastImage from "../fast-image/fast-image";

interface LoadingPageProps {
  progress: number;
}

function LoadingPage({ progress }: LoadingPageProps) {
  const animationDuration = progress >= 100 ? 1 : 10;

  return (
    <div className="loading-page">
      <FastImage className="loading-sprite" src={LoadingSprite} alt="Loading" />

      <div className="loading-progress-container">
        <motion.div
          className="loading-progress-bar"
          animate={{ width: `${progress}%` }}
          transition={{
            type: "tween",
            duration: animationDuration,
            ease: progress >= 100 ? "easeOut" : "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

export default LoadingPage;
