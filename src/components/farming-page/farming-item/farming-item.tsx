import { useState, useEffect } from "react";
import { useSocket } from "../../../redux/socket/socket-context";
import LoopingTimerBar from "../../looping-timer-bar/looping-timer-bar";
import TimerIcon from "../../../assets/images/general/timer.svg";
import "./farming-item.css";
import { useIdleSkillSocket } from "../../../redux/socket/idle/skill-context";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useCurrentActivityContext } from "../../../redux/socket/idle/current-activity-context";

interface FarmingItemProps {
  id: number;
  name: string;
  rarity: string;
  description: string;
  farmingDurationS: number;
  farmingLevelRequired: number;
  farmingExp: number;
  farmingStatus: {
    startTimestamp: number;
    durationS: number;
  } | null;
  imgsrc: string;
}

function FarmingItem(props: FarmingItemProps) {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { userData } = useUserSocket();
  const [isFarmable, setIsFarmable] = useState(false);
  const { socket } = useSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const { startFarming, stopFarming } = useIdleSkillSocket();
  const { setCurrentActivity } = useCurrentActivityContext();
  const [isFarming, setIsFarming] = useState(false);

  const handleFarmButton = () => {
    if (socket && canEmitEvent() && telegramId) {
      if (isFarming) {
        socket.emit("stop-farm-item", props.id);

        stopFarming(props.id);
        setIsFarming(false);
      } else {
        console.log(props.id)
        socket.emit("farm-item", props.id);

        startFarming(props.id, Date.now(), props.farmingDurationS);
        setIsFarming(true);
      }
      setLastEventEmittedTimestamp(Date.now());

    }
  };

  useEffect(() => {
    setIsFarmable(userData.farmingLevel >= props.farmingLevelRequired);
  }, [userData.farmingLevel]);

  useEffect(() => {
    if (props.farmingStatus !== null) {
      setIsFarming(true);
      setCurrentActivity({
        type: 'farming',
        id: props.id,
        name: props.name,
        startTimestamp: props.farmingStatus.startTimestamp,
        durationS: props.farmingStatus.durationS,
        imgsrc1: props.imgsrc
      });
    } else {
      setIsFarming(false);
    }
  }, [props.farmingStatus]);

  return (
    <div className="farming-item-container">
      <div className="farming-item-level">Lvl {props.farmingLevelRequired}</div>
      <div className="farming-item-inner-container">
        <div className="farm-item-header">
          <div className="farm-item-name">{props.name}</div>
          <div className="farm-item-info-container">
            <div className="farm-item-duration-container">
              <img src={TimerIcon}></img>
              <div className="farm-item-duration">
                {props.farmingDurationS}s
              </div>
            </div>
            <div className="farm-item-exp"><div>XP</div><div>{props.farmingExp}</div></div>
          </div>
        </div>
        <div className="farm-item-img-container">
          <img src={props.imgsrc}></img>
        </div>
        {isFarming && props.farmingStatus ? (
          <LoopingTimerBar
            durationS={props.farmingStatus.durationS || props.farmingDurationS} // Use standard duration for looping
            startTimestamp={props.farmingStatus.startTimestamp}
          />
        ) : (
          <div className="placeholder-timer-bar"></div>
        )}
        <button
          className={`farm-button ${isFarming ? "farming-active" : ""}`}
          onClick={handleFarmButton}
          disabled={!isFarmable}
        >
          {isFarming ? "Cancel" : "Farm"}
        </button>
      </div>
    </div>
  );
}

export default FarmingItem;
