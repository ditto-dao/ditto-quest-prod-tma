import "./level-up-notification.css";
import Fireworks from "../../../../assets/images/general/celebration.png";
import FastImage from "../../../fast-image/fast-image";

interface LevelUpNotificationProps {
  lvlLabel: string;
  newLevel: number;
}

function LevelUpNotification(props: LevelUpNotificationProps) {
  return (
    <div className="level-up-notification">
      <div className="level-up-notification-header">
        <FastImage src={Fireworks} alt="Fireworks" />
        <div>Level Up</div>
      </div>
      <div className="level-up-message">
        Congratulations! You have reached {props.lvlLabel}{" "}
        <span>{props.newLevel}</span>.
      </div>
    </div>
  );
}

export default LevelUpNotification;
