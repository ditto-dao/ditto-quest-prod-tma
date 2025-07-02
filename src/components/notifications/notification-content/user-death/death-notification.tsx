import "./death-notification.css";
import Death from "../../../../assets/images/combat/death.png";
import FastImage from "../../../fast-image/fast-image";

function DeathNotification() {
  return (
    <div className="death-notification">
      <div className="death-notificaation-header">
        <FastImage src={Death} alt="Death" />
      </div>
      <div className="death-message">You have died...</div>
    </div>
  );
}

export default DeathNotification;
