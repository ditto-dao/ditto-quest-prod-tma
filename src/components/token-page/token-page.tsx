import { useLoginSocket } from "../../redux/socket/login/login-context";
import { useSocket } from "../../redux/socket/socket-context";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
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
import FastImage from "../../components/fast-image/fast-image";
import {
  ON_CHAIN_PRICE_UPDATE_RES_EVENT,
  READ_ON_CHAIN_PRICE_EVENT,
} from "../../utils/events";
import SwapLogo from "../../assets/images/general/swap.svg";
import TonViewerLogo from "../../assets/images/general/tonviewer-logo-w-name.png";
import StonFiLogo from "../../assets/images/general/ston-fi-logo-w-name.webp";

function TokenPage() {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { dittoBalance } = useUserSocket();
  const { socket } = useSocket();
  const { accessGranted } = useLoginSocket();

  const walletAddress = useTonAddress();

  const [pricesUsd, setPricesUsd] = useState<number[]>([0]);
  const [pricesLoaded, setPricesLoaded] = useState(false);

  function formatPriceWithSubscript(
    price: number,
    maxDigits: number = 6
  ): JSX.Element {
    if (price === 0) {
      return <span>$0</span>;
    }

    const priceStr = price.toString();

    // Handle very small numbers that might be in scientific notation
    let normalizedPrice = price;
    if (priceStr.includes("e")) {
      normalizedPrice = parseFloat(price.toFixed(20));
    }

    const priceString = normalizedPrice.toString();
    const [integerPart, decimalPart = ""] = priceString.split(".");

    // If no decimal part or integer part is not zero, handle normally
    if (integerPart !== "0" || !decimalPart) {
      const truncated = parseFloat(normalizedPrice.toPrecision(maxDigits));
      return <span>${truncated}</span>;
    }

    // Count leading zeros in decimal part
    let leadingZeros = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === "0") {
        leadingZeros++;
      } else {
        break;
      }
    }

    // Get the significant digits after leading zeros
    const significantPart = decimalPart.substring(leadingZeros);

    // If we have leading zeros and they're more than 2, use subscript notation
    if (leadingZeros > 2 && significantPart.length > 0) {
      // Take up to maxDigits from significant part
      const displaySignificant = significantPart.substring(0, maxDigits);

      return (
        <span>
          $0.0<sub>{leadingZeros}</sub>
          {displaySignificant}
        </span>
      );
    }

    // For cases with 1-2 leading zeros, display normally with truncation
    const fullDecimal = "0." + decimalPart;
    const truncated = parseFloat(
      parseFloat(fullDecimal).toPrecision(maxDigits)
    );

    return <span>${truncated}</span>;
  }

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
        socket.emit(`update-user-wallet-address`, walletAddress);
        console.log(
          `updated wallet address for user: ${telegramId}, wallet address: ${walletAddress}`
        );
      }
    }
  }, [walletAddress, socket, accessGranted, telegramId]);

  return (
    <div className="token-page">
      <TonConnectButton className="tonconnect-button" />
      <div className="tab-selector">
        <div className="tab active">Balance</div>
        <div className="tab disabled">Withdraw</div>
        <div className="tab disabled">Deposit</div>
      </div>
      <div className="balance-card">
        <div className="balance-icon-container">
          <FastImage
            src={DittoCoinLogo}
            className="ditto-icon"
            alt="Ditto Coin"
          />
          <FastImage
            src={TonLogo}
            className="ton-overlay-icon"
            alt="TON Logo"
          />
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
          <FastImage
            src={DittoCoinLogo}
            className="ditto-icon"
            alt="Ditto Coin"
          />
          <FastImage
            src={GameEcosystemLogo}
            className="ton-overlay-icon"
            alt="Game Ecosystem"
          />
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
            {formatPriceWithSubscript(pricesUsd[pricesUsd.length - 1], 4)}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">24h</div>
          <div
            className={`stat-value ${
              pricesUsd.length >= 6
                ? pricesUsd[pricesUsd.length - 1] >= pricesUsd[0]
                  ? "positive"
                  : "negative"
                : ""
            }`}
          >
            {pricesUsd.length < 6 ? (
              "0%"
            ) : (
              <>
                {pricesUsd[pricesUsd.length - 1] >= pricesUsd[0] ? "▲" : "▼"}{" "}
                {formatMaxDigits(
                  ((pricesUsd[pricesUsd.length - 1] - pricesUsd[0]) /
                    pricesUsd[0]) *
                    100,
                  3
                )}
                %
              </>
            )}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">FDV</div>
          <div className="stat-value">
            ${formatMaxDigits((pricesUsd[pricesUsd.length - 1] || 0) * 1e11, 5)}
          </div>
        </div>
      </div>
      <div className="stat-box-full">
        <div className="stat-value">10,000 DITTO</div>
        <div className="stat-label-img-container">
          <FastImage src={SwapLogo} alt="Swap Icon" />
        </div>
        <div className="stat-value">
          ${formatMaxDigits((pricesUsd[pricesUsd.length - 1] || 0) * 10000, 6)}
        </div>
      </div>
      <div className="token-footer-buttons">
        <a
          href="https://app.ston.fi/swap?ft=EQBeLoy2H1BlIToCWll_U4M7vi5rGXzBexSnKzOj07urVMNT&chartVisible=true&chartInterval=1w&tt=TON"
          target="_blank"
          rel="noopener noreferrer"
          className="logo-wrapper"
        >
          <div className="logo-container">
            <FastImage src={StonFiLogo} alt="StonFi" />
          </div>
        </a>
        <a
          href="https://tonviewer.com/EQBeLoy2H1BlIToCWll_U4M7vi5rGXzBexSnKzOj07urVMNT"
          target="_blank"
          rel="noopener noreferrer"
          className="logo-wrapper"
        >
          <div className="logo-container tonviewer-zoom">
            <FastImage src={TonViewerLogo} alt="TonViewer" />
          </div>
        </a>
      </div>
    </div>
  );
}

export default TokenPage;
