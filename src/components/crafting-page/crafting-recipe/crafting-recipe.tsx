import {
  CraftingStatus,
  useIdleSkillSocket,
} from "../../../redux/socket/idle/skill-context";
import { useSocket } from "../../../redux/socket/socket-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import LoopingTimerBar from "../../looping-timer-bar/looping-timer-bar";
import TimerIcon from "../../../assets/images/general/timer.svg";
import Expand from "../../../assets/images/general/down.svg";
import Minimize from "../../../assets/images/general/up.svg";
import "./crafting-recipe.css";
import { useState, useEffect } from "react";
import { formatDuration } from "../../../utils/helpers";
import { preloadImagesBatch } from "../../../utils/image-cache";
import FastImage from "../../../components/fast-image/fast-image";
import { EquipmentType } from "../../../utils/types";
import { useCurrentActivityContext } from "../../../redux/socket/idle/current-activity-context";
import { useCombatSocket } from "../../../redux/socket/idle/combat-context";
import ExitCombatMsg from "../../notifications/notification-content/exit-combat-first/exit-combat-first";
import { useNotification } from "../../notifications/notification-context";

interface CraftingRecipeProps {
  equipmentId: number;
  equipmentName: string;
  type: EquipmentType;
  durationS: number;
  craftingLevelRequired: number;
  craftingExp: number;
  requiredItems: {
    itemId: number;
    itemName: string;
    quantity: number;
    imgsrc: string;
  }[];
  craftingStatus: CraftingStatus | null; // New prop to track crafting start time
  imgsrc: string;
}

function CraftingRecipe(props: CraftingRecipeProps) {
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const { userData } = useUserSocket();
  const { startCrafting, stopCrafting } = useIdleSkillSocket();
  const { socket } = useSocket();
  const { setCurrentActivity } = useCurrentActivityContext();
  const { isBattling } = useCombatSocket();
  const { addNotification } = useNotification();

  const [isCraftable, setIsCraftable] = useState(false);
  const [isCrafting, setIsCrafting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dynamicImagesLoaded, setDynamicImagesLoaded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Preload dynamic images from props (equipment and required item images from backend)
  useEffect(() => {
    const preloadCraftingImages = async () => {
      const dynamicImages = [
        props.imgsrc, // Equipment image from backend
        ...props.requiredItems.map((item) => item.imgsrc), // Required item images from backend
      ].filter(Boolean) as string[];

      if (dynamicImages.length > 0) {
        try {
          await preloadImagesBatch(dynamicImages);
          setDynamicImagesLoaded(true);
        } catch (error) {
          console.error("Failed to preload some crafting images:", error);
          setDynamicImagesLoaded(true); // Still proceed even if some images fail
        }
      } else {
        setDynamicImagesLoaded(true); // No dynamic images to load
      }
    };

    preloadCraftingImages();
  }, [props.imgsrc, props.requiredItems]);

  const handleCraftButton = () => {
    if (socket && canEmitEvent()) {
      if (isCrafting) {
        socket.emit("stop-craft-equipment", props.equipmentId);
        stopCrafting(props.equipmentId);
        setIsCrafting(false);
      } else {
        if (isBattling) {
          addNotification(() => <ExitCombatMsg />);
          return;
        }

        socket.emit("craft-equipment", props.equipmentId);
        startCrafting(props.equipmentId, Date.now(), props.durationS);
        setIsCrafting(true);
      }
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  useEffect(() => {
    if (props.craftingStatus === null) {
      setIsCrafting(false);
    } else {
      setIsCrafting(true);
      setCurrentActivity({
        type: "crafting",
        id: props.equipmentId,
        name: props.equipmentName,
        startTimestamp: props.craftingStatus.startTimestamp,
        durationS: props.craftingStatus.durationS,
        imgsrc1: props.imgsrc,
      });
    }
  }, [props.craftingStatus]);

  useEffect(() => {
    // Check if user has all necessary items in sufficient quantity
    const canCraft = props.requiredItems.every((requiredItem) => {
      const userItem = userData.inventory.find(
        (item) => item.itemId === requiredItem.itemId
      );
      return userItem && userItem.quantity >= requiredItem.quantity;
    });

    setIsCraftable(
      canCraft && userData.craftingLevel >= props.craftingLevelRequired
    );
  }, [props.requiredItems, userData.inventory]);

  return (
    <div className="crafting-recipe-container">
      <div className="crafting-recipe-level">
        Lvl {props.craftingLevelRequired}
      </div>
      <div className="crafting-recipe-inner-container">
        <div className="crafting-recipe-header">
          <div className="crafting-equipment-img-container">
            {dynamicImagesLoaded ? (
              <FastImage src={props.imgsrc} alt={props.equipmentName} />
            ) : (
              <div className="crafting-image-placeholder shimmer" />
            )}
          </div>
          <div className="crafting-recipe-header-info">
            <div className="equipment-name">{props.equipmentName}</div>
            <div className="equipment-craft-stats">
              <div className="equipment-craft-duration">
                <FastImage src={TimerIcon} alt="Timer Icon" />
                <div>{formatDuration(props.durationS)}</div>
              </div>
              <div className="equipment-craft-exp">
                <div>XP</div>
                <div>{props.craftingExp}</div>
              </div>
            </div>
            <button
              className={`craft-button ${isCrafting ? "crafting-active" : ""}`}
              disabled={!isCraftable && !isCrafting}
              onClick={handleCraftButton}
            >
              {isCrafting ? "Cancel" : "Craft"}
            </button>
          </div>
          <div className="craft-expand-img-container">
            <FastImage
              src={isExpanded ? Minimize : Expand}
              onClick={toggleExpand}
              alt="Toggle Expand"
            />
          </div>
        </div>
        {isCrafting && props.craftingStatus && (
          <div className="craft-timer-container">
            <LoopingTimerBar
              durationS={props.craftingStatus.durationS || props.durationS} // Use standard duration for looping
              startTimestamp={props.craftingStatus.startTimestamp}
            />
          </div>
        )}
        <div
          className={`required-items ${isExpanded ? "expanded" : "collapsed"}`}
        >
          {isExpanded && dynamicImagesLoaded && (
            <>
              <div className="required-items-header">Required Items</div>
              {props.requiredItems.map((item, index) => {
                const userItem = userData.inventory.find(
                  (userItem) => userItem.itemId === item.itemId
                );
                const userQuantity = userItem ? userItem.quantity : 0;

                // Determine additional classes for styling
                const isAlternate = index % 2 === 1; // True for alternate items
                const isLast = index === props.requiredItems.length - 1; // True for last item
                const itemClassName = `required-item ${
                  isAlternate ? "alternate" : ""
                } ${isLast ? "last-item" : ""}`;

                return (
                  <div key={index} className={itemClassName}>
                    <FastImage src={item.imgsrc} alt={item.itemName} />
                    <div className="crafting-req-item-name">
                      {item.itemName}{" "}
                      <span
                        className={`quantity ${
                          userQuantity >= item.quantity
                            ? "enough"
                            : "not-enough"
                        }`}
                      >
                        {userQuantity}
                      </span>
                      /{item.quantity}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CraftingRecipe;
