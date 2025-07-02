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
import { preloadImagesBatch } from "../../utils/image-cache";
import FastImage from "../fast-image/fast-image";

function LoaderBlock({ className }: { className: string }) {
  return <div className={`shimmer ${className}`} />;
}

function CurrentActivityDisplay() {
  const {} = useIdleSkillSocket();
  const { monster } = useCombatSocket();
  const { currentActivity } = useCurrentActivityContext();
  const [dynamicImagesLoaded, setDynamicImagesLoaded] = useState(false);

  useEffect(() => {
    if (!currentActivity) return;

    const preloadActivityImages = async () => {
      const dynamicImages: string[] = [];

      // Add activity images (from backend)
      if (currentActivity.imgsrc1) dynamicImages.push(currentActivity.imgsrc1);
      if (
        currentActivity.type === "breeding" &&
        "imgsrc2" in currentActivity &&
        currentActivity.imgsrc2
      ) {
        dynamicImages.push(currentActivity.imgsrc2);
      }

      // Add monster image if in combat (from backend)
      if (monster?.imgsrc) dynamicImages.push(monster.imgsrc);

      if (dynamicImages.length > 0) {
        try {
          await preloadImagesBatch(dynamicImages);
          setDynamicImagesLoaded(true);
        } catch (error) {
          console.error("Failed to preload some activity images:", error);
          setDynamicImagesLoaded(true); // Still proceed even if some images fail
        }
      } else {
        setDynamicImagesLoaded(true); // No dynamic images to load
      }
    };

    preloadActivityImages();
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
                ${!dynamicImagesLoaded ? "shimmer" : ""}
              `}
            >
              {!dynamicImagesLoaded || (type === "combat" && !monster) ? (
                <div className="image-loader" />
              ) : type === "breeding" && imgsrc1 && imgsrc2 ? (
                [
                  <FastImage key="img1" src={imgsrc1} alt="Parent Slime 1" />,
                  <FastImage key="img2" src={imgsrc2} alt="Parent Slime 2" />,
                ]
              ) : (
                imgsrc1 && <FastImage src={imgsrc1} alt={name} />
              )}
            </div>

            {/* MAIN */}
            <div className="current-activity-main-container">
              {/* LABELS */}
              <div className="current-activity-labels-container">
                <div
                  className={`current-activity-img-container ${
                    !dynamicImagesLoaded ? "shimmer-circle shimmer" : ""
                  }`}
                >
                  {/* Static logos are already cached, use FastImage directly */}
                  <FastImage src={logo} alt={`${type} logo`} />
                </div>

                <div
                  className={`current-activity-label ${typeClass} ${
                    !dynamicImagesLoaded ? "shimmer-block shimmer" : ""
                  }`}
                  style={{
                    color: !dynamicImagesLoaded ? "transparent" : undefined,
                  }}
                >
                  {type === "breeding" ? "Breeding Slimes" : name}
                </div>
              </div>

              {/* TIMER or HP BAR */}
              {!dynamicImagesLoaded || (type === "combat" && !monster) ? (
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
