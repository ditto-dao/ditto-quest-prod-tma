import { useEffect, useState } from "react";
import "./sell-modal.css";
import { Inventory } from "../../utils/types";
import GPIcon from "../../assets/images/general/gold-coin.png";
import { formatMaxDigits } from "../../utils/helpers";
import { useSocket } from "../../redux/socket/socket-context";
import { useUserSocket } from "../../redux/socket/user/user-context";
import FastImage from "../fast-image/fast-image";

interface SellNotificationProps {
  selectedItem: Inventory;
  notificationId: string;
  parentNotificationId: string;
  removeNotification: (id: string) => void;
  isEquipped: boolean;
}

function SellNotification(props: SellNotificationProps) {
  const target = props.selectedItem.equipment || props.selectedItem.item;
  if (target === null || target === undefined)
    throw new Error(`Sell target undefined`);
  const maxSellAmount = props.isEquipped
    ? props.selectedItem.quantity - 1
    : props.selectedItem.quantity;

  const { socket } = useSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();

  const [sellAmount, setSellAmount] = useState(1);
  const [sellValue, setSellValue] = useState(target.sellPriceGP);

  useEffect(() => {
    setSellValue(sellAmount * target.sellPriceGP);
  }, [sellAmount]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSellAmount(parseInt(e.target.value));
  };

  const handleSellAll = () => {
    setSellAmount(maxSellAmount);
  };

  const handleSellAllButOne = () => {
    setSellAmount(Math.max(1, maxSellAmount - 1));
  };

  const confirmSell = () => {
    if (socket && canEmitEvent()) {
      if (props.selectedItem.equipment) {
        console.log(`Emitting sell-equipment`);
        socket.emit("sell-equipment", {
          equipmentId: props.selectedItem.equipment.id,
          quantity: sellAmount,
        });
        setLastEventEmittedTimestamp(Date.now());
      } else if (props.selectedItem.item) {
        console.log(`Emitting sell-item`);
        socket.emit("sell-item", {
          itemId: props.selectedItem.item.id,
          quantity: sellAmount,
        });
        setLastEventEmittedTimestamp(Date.now());
      } else {
        console.error(`Unexpected inventory item`);
        return;
      }
    }
    props.removeNotification(props.notificationId);
    props.removeNotification(props.parentNotificationId);
  };

  return (
    <div className="sell-notification">
      <div className="sell-message">
        Confirm sell {target.name} x{sellAmount}?
      </div>

      <div className="sell-slider-container">
        <div className="sell-slider-labels">
          <span className="sell-amount-display">{sellAmount}</span>
        </div>
        <input
          type="range"
          min="1"
          max={maxSellAmount}
          value={sellAmount}
          onChange={handleSliderChange}
          className="sell-slider"
        />
        <div className="sell-quick-buttons">
          <button
            className="sell-quick-button"
            onClick={handleSellAll}
            disabled={sellAmount === maxSellAmount}
          >
            All
          </button>
          <button
            className="sell-quick-button"
            onClick={handleSellAllButOne}
            disabled={sellAmount === Math.max(1, maxSellAmount - 1)}
          >
            All but One
          </button>
        </div>
      </div>

      <div className="sell-value">
        <div className="sell-value-img-container">
          <FastImage src={GPIcon} alt="GP" />
        </div>
        <div className="sell-value-amount">
          {formatMaxDigits(sellValue, 5)} GP
        </div>
      </div>

      <button className="notif-sell-button" onClick={confirmSell}>
        Confirm
      </button>
    </div>
  );
}

export default SellNotification;
