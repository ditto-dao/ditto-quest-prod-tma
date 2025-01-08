import { useState, useEffect } from "react";
import { useSocket } from "../../../redux/socket/socket-context";
import LoopingTimerBar from "../../looping-timer-bar/looping-timer-bar";
import TimerIcon from "../../../assets/images/general/timer.svg";
import "./farming-item.css";
import { useIdleSocket } from "../../../redux/socket/idle/idle-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import { formatDuration } from "../../../utils/helpers";

interface FarmingItemProps {
  itemId: number;
  itemName: string;
  rarity: string;
  description: string;
  durationS: number;
  farmingLevelRequired: number;
  farmingExp: number;
  farmingStatus: {
    startTimestamp: number;
    durationS: number;
  } | null;
  imgsrc: string;
}

function FarmingItem(props: FarmingItemProps) {
  const { socket } = useSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const { startFarming, stopFarming } = useIdleSocket();
  const [isFarming, setIsFarming] = useState(false);

  const handleFarmButton = () => {
    if (socket && canEmitEvent()) {
      if (isFarming) {
        socket.emit("stop-farm-item", props.itemId);
        setLastEventEmittedTimestamp(Date.now());

        stopFarming(props.itemId);
        setIsFarming(false);
      } else {
        socket.emit("farm-item", props.itemId);
        setLastEventEmittedTimestamp(Date.now());

        startFarming(props.itemId, Date.now() + 200, props.durationS);
        setIsFarming(true);
      }
    }
  };

  useEffect(() => {
    if (props.farmingStatus !== null) {
      setIsFarming(true);
    } else {
      setIsFarming(false);
    }
  }, [props.farmingStatus]);

  return (
    <div className="farming-item-container">
      <div className="farming-item-level">Lvl {props.farmingLevelRequired}</div>
      <div className="farming-item-inner-container">
        <div className="farm-item-header">
          <div className="farm-item-name">{props.itemName}</div>
          <div className="farm-item-info-container">
            <div className="farm-item-duration-container">
              <img src={TimerIcon}></img>
              <div className="farm-item-duration">
                {formatDuration(props.durationS)}
              </div>
            </div>
            <div className="farm-item-exp">{props.farmingExp} XP</div>
          </div>
        </div>
        <div className="farm-item-img-container">
          <img src={props.imgsrc}></img>
        </div>
        {isFarming && props.farmingStatus ? (
          <LoopingTimerBar
            durationS={props.farmingStatus.durationS || props.durationS} // Use standard duration for looping
            startTimestamp={props.farmingStatus.startTimestamp}
          />
        ) : (
          <div className="placeholder-timer-bar"></div>
        )}
        <button
          className={`farm-button ${isFarming ? "farming-active" : ""}`}
          onClick={handleFarmButton}
        >
          {isFarming ? "Cancel" : "Farm"}
        </button>
      </div>
    </div>
  );
}

export default FarmingItem;
