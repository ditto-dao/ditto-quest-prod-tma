import "./sell-slime-modal.css";
import { SlimeWithTraits } from "../../../../utils/types";
import { useSocket } from "../../../../redux/socket/socket-context";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import {
  formatMaxDigits,
  getHighestDominantTraitRarity,
} from "../../../../utils/helpers";
import GPIcon from "../../../../assets/images/general/gold-coin.png";
import FastImage from "../../../fast-image/fast-image";

interface SellSlimeNotificationProps {
  selectedSlime: SlimeWithTraits;
  notificationId: string;
  parentNotificationId: string;
  removeNotification: (id: string) => void;
}

function SellSlimeNotification(props: SellSlimeNotificationProps) {
  const { socket } = useSocket();
  const { removeSlimeById } = useUserSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();

  const getSellValueGP = (): number => {
    const rarity = getHighestDominantTraitRarity(props.selectedSlime);
    if (rarity === "SS") return 50000;
    else if (rarity == "S") return 25000;
    else if (rarity == "A") return 10000;
    else if (rarity == "B") return 5000;
    else if (rarity == "C") return 2500;
    else if (rarity == "D") return 1000;
    else return 0;
  };

  const confirmSell = () => {
    if (socket && canEmitEvent()) {
      console.log(`Emitting burn-slime`);
      socket.emit("burn-slime", props.selectedSlime.id);
      setLastEventEmittedTimestamp(Date.now());
      removeSlimeById(props.selectedSlime.id);
    }
    props.removeNotification(props.notificationId);
    props.removeNotification(props.parentNotificationId);
  };

  return (
    <div className="sell-slime-notification">
      <div className="sell-slime-message">
        Confirm sell Slime #{props.selectedSlime.id}?
      </div>

      <div className="sell-slime-value">
        <div className="sell-slime-value-img-container">
          <FastImage src={GPIcon} alt="GP" />
        </div>
        <div className="sell-slime-value-amount">
          {formatMaxDigits(getSellValueGP(), 6)} GP
        </div>
      </div>

      <button className="notif-sell-slime-button" onClick={confirmSell}>
        Confirm
      </button>
    </div>
  );
}

export default SellSlimeNotification;
