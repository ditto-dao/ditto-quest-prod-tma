import { useEffect, useState } from "react";
import "./paywall-notification.css";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../../../utils/config";
import {
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "../../../../utils/helpers";
import DittoCoinIcon from "../../../../assets/images/general/ditto-coin.png";
import GPIcon from "../../../../assets/images/general/gold-coin.png";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import FastImage from "../../../fast-image/fast-image";

interface PaywallProps {
  notificationId: string;
  removeNotification: (id: string) => void;
  message: string;
  dittoAmountWei?: string;
  gpAmount?: number;
  onUseDitto?: {
    fn: (param?: any) => void;
    args?: any;
  };
  onUseGp?: {
    fn: (param?: any) => void;
    args?: any;
  };
}

function PaywallNotification(props: PaywallProps) {
  const { message, dittoAmountWei, gpAmount, onUseDitto, onUseGp } = props;
  const { userData, dittoBalance } = useUserSocket();

  const [dittoAmountStr, setDittoAmountStr] = useState(dittoAmountWei || "0");
  const [gpAmountStr, setGpAmountStr] = useState(gpAmount?.toString() || "0");

  useEffect(() => {
    if (dittoAmountWei) {
      const entryPriceDittoNumber = Number(
        formatUnits(dittoAmountWei || "0", DITTO_DECIMALS)
      );
      if (entryPriceDittoNumber < 1000000) {
        setDittoAmountStr(formatNumberWithCommas(entryPriceDittoNumber));
      } else {
        setDittoAmountStr(formatNumberWithSuffix(entryPriceDittoNumber));
      }
    }
  }, [dittoAmountWei]);

  useEffect(() => {
    if (gpAmount) {
      const entryPriceGpNumber = Number(gpAmount);
      if (entryPriceGpNumber < 1000000) {
        setGpAmountStr(formatNumberWithCommas(entryPriceGpNumber));
      } else {
        setGpAmountStr(formatNumberWithSuffix(entryPriceGpNumber));
      }
    }
  }, [gpAmount]);

  const hasDitto =
    !!dittoAmountWei && BigInt(dittoAmountWei) > 0n && !!onUseDitto;

  const hasGP = typeof gpAmount !== "undefined" && gpAmount >= 0 && !!onUseGp;

  if (!hasDitto && !hasGP) {
    return (
      <div className="paywall-notification">
        <div className="paywall-message-error">Something went wrong...</div>
      </div>
    );
  }

  const handlePayDitto = async () => {
    if (onUseDitto) onUseDitto.fn(onUseDitto.args);
    props.removeNotification(props.notificationId);
  };

  const handlePayGp = () => {
    if (onUseGp) onUseGp.fn(onUseGp.args);
    props.removeNotification(props.notificationId);
  };

  return (
    <div className="paywall-notification">
      <div className="paywall-message">{message}</div>

      <div
        className={`paywall-buttons ${hasDitto && hasGP ? "dual" : "single"}`}
      >
        {hasDitto && (
          <button
            className="paywall-button"
            disabled={
              dittoBalance.accumulatedBalance + dittoBalance.liveBalance <
              BigInt(dittoAmountWei || "0")
            }
            onClick={handlePayDitto}
          >
            <div className="paywall-button-top">
              <FastImage src={DittoCoinIcon} alt="DittoCoinIcon" />
              <span>DITTO</span>
            </div>
            <div className="paywall-button-bottom">{dittoAmountStr}</div>
          </button>
        )}

        {hasGP && (
          <button
            className="paywall-button"
            disabled={
              typeof gpAmount === "number" && userData.goldBalance < gpAmount
            }
            onClick={handlePayGp}
          >
            <div className="paywall-button-top">
              <FastImage src={GPIcon} alt="GP" />
              <span>GP</span>
            </div>
            <div className="paywall-button-bottom">{gpAmountStr}</div>
          </button>
        )}
      </div>
    </div>
  );
}

export default PaywallNotification;
