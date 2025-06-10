import { useLoginSocket } from "../../redux/socket/login/login-context";
import { useSocket } from "../../redux/socket/socket-context";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { /* TonConnectButton, */ useTonAddress } from "@tonconnect/ui-react";
import "./token-page.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../utils/config";
import { FORMATTER_MIN_0_MAX_3_DP } from "../../utils/formatter";
import TonLogo from "../../assets/images/general/ton-logo.png";
import GameEcosystemLogo from "../../assets/images/sidebar/game-eco-icon.png";
import { formatMaxDigits } from "../../utils/helpers";
import {
  ON_CHAIN_PRICE_UPDATE_RES_EVENT,
  READ_ON_CHAIN_PRICE_EVENT,
} from "../../utils/events";

function TokenPage() {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { dittoBalance } = useUserSocket();
  const { socket } = useSocket();
  const { accessGranted } = useLoginSocket();

  const walletAddress = useTonAddress();

  const [pricesUsd, setPricesUsd] = useState([0.00001]);
  const [pricesLoaded, setPricesLoaded] = useState(false);

  useEffect(() => {
    if (socket) {
      if (!pricesLoaded) {
        console.log("Emitting READ_ON_CHAIN_PRICE_EVENT");
        socket.emit(READ_ON_CHAIN_PRICE_EVENT);
      }
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on(
        ON_CHAIN_PRICE_UPDATE_RES_EVENT,
        (res: { prices: number[] }) => {
          console.log(
            `received ON_CHAIN_PRICE_UPDATE_RES_EVENT: ${JSON.stringify(
              res.prices
            )}`
          );
          setPricesUsd(res.prices);
          if (!pricesLoaded) setPricesLoaded(true);
        }
      );

      return () => {
        socket.off(ON_CHAIN_PRICE_UPDATE_RES_EVENT);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && accessGranted) {
      if (walletAddress.length > 0 && telegramId) {
        socket.emit(`update-user-wallet-address`, {
          userId: telegramId,
          walletAddress: walletAddress,
        });
        console.log(
          `updated wallet address for user: ${telegramId}, wallet address: ${walletAddress}`
        );
      }
    }
  }, [walletAddress, socket, accessGranted, telegramId]);

  return (
    <div className="token-page">
      {/* <TonConnectButton className="tonconnect-button" /> */}
      <div className="tab-selector">
        <div className="tab active">Balance</div>
        <div className="tab disabled">Withdraw</div>
        <div className="tab disabled">Deposit</div>
      </div>
      <div className="balance-card">
        <div className="balance-icon-container">
          <img src={DittoCoinLogo} className="ditto-icon" />
          <img src={TonLogo} className="ton-overlay-icon" />
        </div>
        <div className="balance-details-container">
          <div className="balance-details-name">Dittocoin</div>
          <div className="balance-details-amount">
            {FORMATTER_MIN_0_MAX_3_DP.format(
              parseFloat(formatUnits(dittoBalance.liveBalance, DITTO_DECIMALS))
            )}{" "}
            DITTO
          </div>
        </div>
        <div className="balance-usd-container">
          $
          {formatMaxDigits(
            parseFloat(formatUnits(dittoBalance.liveBalance, DITTO_DECIMALS)) *
              /* pricesUsd[pricesUsd.length - 1] */ 0.00001,
            5
          )}
        </div>
      </div>
      <div className="balance-card">
        <div className="balance-icon-container">
          <img src={DittoCoinLogo} className="ditto-icon" />
          <img src={GameEcosystemLogo} className="ton-overlay-icon" />
        </div>
        <div className="balance-details-container">
          <div className="balance-details-name">Dittocoin X</div>
          <div className="balance-details-amount">
            {FORMATTER_MIN_0_MAX_3_DP.format(
              parseFloat(
                formatUnits(dittoBalance.accumulatedBalance, DITTO_DECIMALS)
              )
            )}{" "}
            DITTOX
          </div>
        </div>
        <div className="balance-usd-container">-</div>
      </div>
      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-label">Price</div>
          <div className="stat-value">
            $0.0<sub>4</sub>1
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">24h</div>
          <div
            className={`stat-value ${
/*               pricesUsd.length >= 6
                ? pricesUsd[pricesUsd.length - 1] >= pricesUsd[0]
                  ? "positive"
                  : "negative"
                :  */""
            }`}
          >
            {pricesUsd.length < 6 ? (
              "0%"
            ) : (
              <>
{/*                 {pricesUsd[pricesUsd.length - 1] >= pricesUsd[0] ? "▲" : "▼"}{" "}
                {formatMaxDigits(
                  ((pricesUsd[pricesUsd.length - 1] - pricesUsd[0]) /
                    pricesUsd[0]) *
                    100,
                  3
                )} */}
								0%
              </>
            )}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">FDV</div>
          <div className="stat-value">
            {/* ${formatMaxDigits((pricesUsd[pricesUsd.length - 1] || 0) * 1e11, 5)} */}
            ${formatMaxDigits(1000000, 6)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenPage;
