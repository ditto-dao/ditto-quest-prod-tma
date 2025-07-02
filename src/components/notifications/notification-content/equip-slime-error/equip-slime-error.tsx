import "./equip-slime-error.css";
import PanicSlime from "../../../../assets/images/general/panic-slime.png";
import FastImage from "../../../fast-image/fast-image";

function EquipSlimeNotification() {
  return (
    <div className="equip-slime-notification">
      <div className="equip-slime-notificaation-header">
        <FastImage src={PanicSlime} alt="Panic slime" />
        <div>No Slime Equipped</div>
      </div>
      <div className="equip-slime-message">
        Go to <span>Slime Lab</span> {">"} <span>Inventory</span> and equip a
        slime first. If you do not own a slime, pull one from the{" "}
        <span>Gacha</span>.
      </div>
    </div>
  );
}

export default EquipSlimeNotification;
