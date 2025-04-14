import "./balances.css";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import GoldCoinLogo from "../../assets/images/general/gold-coin.png";
import {
  formatNumberWithSuffix,
  getTotalFormattedBalance,
} from "../../utils/helpers";
import { useUserSocket } from "../../redux/socket/user/user-context";

function BalancesDisplay() {
  const { userData, dittoBalance } = useUserSocket();
  return (
    <div className="balances-wrapper">
      <div className="balances-container-inner">
        <div className="balances-container-label">Bank</div>
        <div className="balances-container">
          <div className="coin-balance">
            <div className="coin-label-row">
              <img src={DittoCoinLogo} alt="Ditto Coin" className="coin-logo" />
              <span>DITTO</span>
            </div>
            <div className="coin-amount">
              {formatNumberWithSuffix(getTotalFormattedBalance(dittoBalance))}
            </div>
          </div>

          <div className="coin-balance">
            <div className="coin-label-row">
              <img src={GoldCoinLogo} alt="Gold Coin" className="coin-logo" />
              <span>GP</span>
            </div>
            <div className="coin-amount">
              {formatNumberWithSuffix(userData.goldBalance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalancesDisplay;
