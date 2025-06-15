import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./mission-modal.css";
import { useMissionNotification } from "./mission-context";
import GuideImg from "../../assets/images/general/slime-elder.png";
import DittoCoin from "../../assets/images/general/ditto-coin.png";
import { conversations } from "./conversations";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../utils/config";
import { INTL_FORMATTER_INT } from "../../utils/formatter";

export function MissionModal() {
  const { mission, emitGetNextMission } = useMissionNotification();
  const isComplete = mission && mission.progress >= mission.quantity;
  const [showMission, setShowMission] = useState(false);
  const [conversationIndex, setConversationIndex] = useState(0);
  const constraintRef = useRef<HTMLDivElement>(null);

  const currentRound = mission?.round ?? 0;
  const activeConversation = conversations[currentRound];
  const isInConversation =
    mission && activeConversation && mission.progress === 0 && !showMission;
  const currentText = activeConversation?.[conversationIndex];

  const nextLine = () => {
    if (!activeConversation) return;
    if (conversationIndex < activeConversation.length - 1) {
      setConversationIndex((i) => i + 1);
    } else {
      setShowMission(true);
    }
  };

  const prevLine = () => {
    if (conversationIndex > 0) {
      setConversationIndex((i) => i - 1);
    }
  };

  useEffect(() => {
    if (mission) {
      setShowMission(false);
      setConversationIndex(0);
    }
  }, [mission?.round]);

  return (
    <AnimatePresence>
      {mission && (
        <div
          ref={constraintRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            zIndex: 4, // ensure it’s above other UI
            pointerEvents: "none", // let clicks pass through except the modal
          }}
        >
          <motion.div
            className="mission-modal"
            drag="y"
            dragConstraints={constraintRef}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="mission-box">
              <div className="mission-left">
                <img src={GuideImg} className="guide-img" />
              </div>
              <div className="mission-right">
                <div className="guide-name">Slime Guide</div>
                <div className="guide-text">
                  {isInConversation ? (
                    <>
                      <p>{currentText}</p>
                      <div className="nav-buttons">
                        {conversationIndex > 0 && (
                          <button onClick={prevLine}>Back</button>
                        )}
                        <button onClick={nextLine}>
                          {conversationIndex < activeConversation.length - 1
                            ? "Next"
                            : "Continue"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mission-label">{mission.label}</p>
                      {mission.rewardDitto && (
                        <div className="mission-payout">
                          <div className="mission-payout-ditto-icon">
                            <img src={DittoCoin}></img>
                          </div>
                          <div className="mission-payout-amount">{INTL_FORMATTER_INT.format(parseFloat(formatUnits(mission.rewardDitto, DITTO_DECIMALS)))}</div>
                        </div>
                      )}
                      <div className="mission-progress-row">
                        <div className="mission-progress-bar">
                          <div
                            className="mission-progress-fill"
                            style={{
                              width: `${Math.min(
                                (mission.progress / mission.quantity) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="progress-label">
                          {mission.progress}/{mission.quantity}
                        </span>
                      </div>
                      <div className="nav-buttons">
                        <button onClick={emitGetNextMission}>
                          {isComplete ? "Claim" : "Skip"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
