import { useEffect, useState } from "react";
import { useIdleSkillSocket } from "../../redux/socket/idle/skill-context";
import LoopingTimerBar from "../looping-timer-bar/looping-timer-bar";
import CraftingLogo from "../../assets/images/sidebar/craft.png";
import FarmingLogo from "../../assets/images/sidebar/farm.png";
import SlimeLabLogo from "../../assets/images/sidebar/slime-lab.png";
import CombatLogo from "../../assets/images/sidebar/combat.png";
import { AnimatePresence, motion } from "framer-motion";
import "./current-activity-display.css";
import { useCombatSocket } from "../../redux/socket/idle/combat-context";
import { useCurrentActivityContext } from "../../redux/socket/idle/current-activity-context";

function LoaderBlock({ className }: { className: string }) {
  return <div className={`shimmer ${className}`} />;
}

function CurrentActivityDisplay() {
  const {} = useIdleSkillSocket();
  const { monster } = useCombatSocket();
  const { currentActivity } = useCurrentActivityContext();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!currentActivity) return;

    const preload: string[] = [];

    if (currentActivity.imgsrc1) preload.push(currentActivity.imgsrc1);
    if (
      currentActivity.type === "breeding" &&
      "imgsrc2" in currentActivity &&
      currentActivity.imgsrc2
    )
      preload.push(currentActivity.imgsrc2);

    if (monster?.imgsrc) preload.push(monster.imgsrc);

    const imagePromises = preload.map((src: string) => {
      const img = new Image();
      img.src = src;
      return new Promise((res) => (img.onload = res));
    });

    Promise.all(imagePromises).then(() => setIsLoaded(true));
  }, [currentActivity, monster]);

  if (!currentActivity) return null;

  const { type, imgsrc1, name } = currentActivity;
  const imgsrc2 =
    type === "breeding" && "imgsrc2" in currentActivity
      ? currentActivity.imgsrc2
      : undefined;

  const startTimestamp =
    "startTimestamp" in currentActivity
      ? currentActivity.startTimestamp
      : undefined;
  const durationS =
    "durationS" in currentActivity ? currentActivity.durationS : undefined;

  const typeClass = type;
  const logo =
    type === "farming"
      ? FarmingLogo
      : type === "crafting"
      ? CraftingLogo
      : type === "breeding"
      ? SlimeLabLogo
      : CombatLogo;

  const getHpBarColor = (hpPercent: number) => {
    if (hpPercent <= 35) return "var(--deep-warm-red)";
    if (hpPercent <= 60) return "var(--burnt-orange)";
    return "var(--sage-green)";
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={name}
        className="current-activity-display-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="current-activity-wrapper">
          <div className={`current-activity ${typeClass}`}>
            {/* IMAGE CONTAINER */}
            <div
              className={`current-activity-images-container
                ${type === "breeding" ? "breeding" : ""}
                ${type === "combat" ? "combat" : ""}
                ${!isLoaded ? "shimmer" : ""}
              `}
            >
              {!isLoaded || (type === 'combat' && !monster) ? (
                <div className="image-loader" />
              ) : type === "breeding" && imgsrc1 && imgsrc2 ? (
                [
                  <img key="img1" src={imgsrc1} />,
                  <img key="img2" src={imgsrc2} />,
                ]
              ) : (
                imgsrc1 && <img src={imgsrc1} />
              )}
            </div>

            {/* MAIN */}
            <div className="current-activity-main-container">
              {/* LABELS */}
              <div className="current-activity-labels-container">
                <div
                  className={`current-activity-img-container ${
                    !isLoaded ? "shimmer-circle shimmer" : ""
                  }`}
                >
                  {isLoaded && <img src={logo} />}
                </div>

                <div
                  className={`current-activity-label ${typeClass} ${
                    !isLoaded ? "shimmer-block shimmer" : ""
                  }`}
                  style={{ color: !isLoaded ? "transparent" : undefined }}
                >
                  {type === "breeding" ? "Breeding Slimes" : name}
                </div>
              </div>

              {/* TIMER or HP BAR */}
              {!isLoaded || (type === "combat" && !monster) ? (
                <LoaderBlock className="shimmer-bar" />
              ) : type === "combat" && monster ? (
                <div className="combat-hp-bar">
                  <div
                    className="combat-hp-bar-fill"
                    style={{
                      width: `${Math.ceil(
                        (monster.combat!.hp / monster.combat!.maxHp) * 100
                      )}%`,
                      backgroundColor: getHpBarColor(
                        Math.ceil(
                          (monster.combat!.hp / monster.combat!.maxHp) * 100
                        )
                      ),
                    }}
                  ></div>
                </div>
              ) : typeof startTimestamp === "number" &&
                typeof durationS === "number" ? (
                <LoopingTimerBar
                  startTimestamp={startTimestamp}
                  durationS={durationS}
                />
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CurrentActivityDisplay;
