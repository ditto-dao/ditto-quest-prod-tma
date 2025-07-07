import "./loading-page.css";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { getRandomTooltip } from "./loading-tooltips";

interface LoadingPageProps {
  progress: number;
}

function LoadingPage({ progress }: LoadingPageProps) {
  const animationDuration = progress >= 100 ? 1 : 10;
  const tooltip = useMemo(() => getRandomTooltip(), []);

  return (
    <div className="loading-page">
      <div className="loading-top">
        <div className="loading-label" />
      </div>

      <div className="loading-bottom">
        <div className="loading-tooltip">{tooltip}</div>
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
    </div>
  );
}

export default LoadingPage;
