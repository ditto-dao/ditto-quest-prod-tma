import { motion, AnimatePresence } from "framer-motion";
import "./floating-update-display.css";
import { useEffect, useState } from "react";
import { formatMaxDigits } from "../../utils/helpers";
import { preloadImagesBatch } from "../../utils/image-cache";
import FastImage from "../fast-image/fast-image";

export interface FloatingUpdate {
  id: string;
  icon: string;
  text: string;
  amount: number;
}

export function FloatingUpdateDisplay({
  updates,
}: {
  updates: FloatingUpdate[];
}) {
  const [iconsLoaded, setIconsLoaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadUpdateIcons = async () => {
      const iconUrls = updates.map((update) => update.icon).filter(Boolean);

      if (iconUrls.length > 0) {
        try {
          await preloadImagesBatch(iconUrls);
          // Mark all current icons as loaded
          setIconsLoaded(new Set(iconUrls));
        } catch (error) {
          console.error("Failed to preload some floating update icons:", error);
          // Still mark as loaded to prevent infinite loading
          setIconsLoaded(new Set(iconUrls));
        }
      }
    };

    preloadUpdateIcons();
  }, [updates]);

  return (
    <div className="floating-update-container">
      <AnimatePresence>
        {updates.map((update) => {
          const isIconLoaded = iconsLoaded.has(update.icon);

          return (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="floating-update-item"
            >
              {isIconLoaded ? (
                <FastImage
                  src={update.icon}
                  className="floating-update-icon"
                  alt="Update Icon"
                />
              ) : (
                <div className="floating-update-icon-placeholder shimmer" />
              )}
              <div className="floating-update-text">{update.text}</div>
              <div className="floating-update-amount">
                <span
                  style={{
                    color:
                      update.amount >= 0
                        ? "var(--forest-green)"
                        : "var(--deep-warm-red)",
                  }}
                >
                  {update.amount > 0
                    ? `+${formatMaxDigits(update.amount, 4)}`
                    : `${formatMaxDigits(update.amount, 4)}`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
