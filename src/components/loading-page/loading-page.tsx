import "./loading-page.css";
import LoadingSprite from "../../assets/images/general/dq-logo.png";
import { useEffect } from "react";
import { preloadImage } from "../../utils/helpers";
import { motion } from "framer-motion";

interface LoadingPageProps {
  progress: number;
}

function LoadingPage({ progress }: LoadingPageProps) {
  useEffect(() => {
    preloadImage(LoadingSprite);
  }, []);

  return (
    <div className="loading-page">
      <img className="loading-sprite" src={LoadingSprite} alt="Loading" />
      <div className="loading-progress-container">
        <motion.div
          className="loading-progress-bar"
          animate={{ width: `${progress}%` }}
          transition={{ type: "tween", duration: 1, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export default LoadingPage;
