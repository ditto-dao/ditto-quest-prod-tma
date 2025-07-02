import "./balances.css";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import GoldCoinLogo from "../../assets/images/general/gold-coin.png";
import { formatMaxDigits, getTotalFormattedBalance } from "../../utils/helpers";
import { useUserSocket } from "../../redux/socket/user/user-context";
import FastImage from "../fast-image/fast-image";

function BalancesDisplay() {
  const { userData, dittoBalance } = useUserSocket();
  return (
    <div className="balances-wrapper">
      <div className="balances-container-inner">
        <div className="balances-container-label">Bank</div>
        <div className="balances-container">
          <div className="coin-balance">
            <div className="coin-label-row">
              <FastImage
                src={DittoCoinLogo}
                alt="Ditto Coin"
                className="coin-logo"
              />
              <span>DITTO</span>
            </div>
            <div className="coin-amount">
              {formatMaxDigits(getTotalFormattedBalance(dittoBalance), 6)}
            </div>
          </div>

          <div className="coin-balance">
            <div className="coin-label-row">
              <FastImage
                src={GoldCoinLogo}
                alt="Gold Coin"
                className="coin-logo"
              />
              <span>GP</span>
            </div>
            <div className="coin-amount">
              {formatMaxDigits(userData.goldBalance, 6)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalancesDisplay;
