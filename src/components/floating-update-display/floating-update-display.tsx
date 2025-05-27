import { motion, AnimatePresence } from "framer-motion";
import "./floating-update-display.css";
import { useEffect } from "react";
import { formatMaxDigits } from "../../utils/helpers";

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
  useEffect(() => {
    updates.forEach((update) => {
      const img = new Image();
      img.src = update.icon;
    });
  }, [updates]);

  return (
    <div className="floating-update-container">
      <AnimatePresence>
        {updates.map((update) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="floating-update-item"
          >
            <img src={update.icon} className="floating-update-icon" />
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
        ))}
      </AnimatePresence>
    </div>
  );
}
