import "./gacha-page.css";
import { useEffect, useRef } from "react";
import TreasureChest from "./treasure-chest/treasure-chest";
import SlimeGachaAnimation from "./slime-gacha-animation/slime-gacha-animation";
import { useSocket } from "../../redux/socket/socket-context";
import { useLoginSocket } from "../../redux/socket/login/login-context";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import GoldCoinLogo from "../../assets/images/general/gold-coin.png";
import {
  formatNumberWithSuffix,
  getDeductionPayloadToDevFunds,
  getTotalFormattedBalance,
} from "../../utils/helpers";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { LEDGER_UPDATE_BALANCE_EVENT } from "../../utils/events";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { SLIME_GACHA_PRICE_DITTO_WEI, SLIME_GACHA_PULL_TRX_NOTE } from "../../utils/trx-config";

function GachaPage() {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { userData, dittoBalance } = useUserSocket();
  const chestRef = useRef<{
    playChestAnimation: () => Promise<void>;
    resetChestAnimation: () => void;
  } | null>(null);

  const slimeRef = useRef<{
    startSlimeAnimation: () => void;
    resetSlimeAnimation: () => void;
  } | null>(null);

  const pullGachaDitto = async () => {
    if (!chestRef.current || !slimeRef.current) return;

    // Reset animations first
    chestRef.current.resetChestAnimation();
    slimeRef.current.resetSlimeAnimation();

    // Wait a brief moment before playing the animation again
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Play chest animation
    await chestRef.current.playChestAnimation();

    // Pull gacha
    if (socket && !loadingSocket && accessGranted && telegramId) {
      socket.emit(LEDGER_UPDATE_BALANCE_EVENT, getDeductionPayloadToDevFunds(telegramId.toString(), dittoBalance, SLIME_GACHA_PRICE_DITTO_WEI, SLIME_GACHA_PULL_TRX_NOTE));
    }

    // Start slime animation after chest animation completes
    slimeRef.current.startSlimeAnimation();
  };

  const pullGachaGold = async () => {
    if (!chestRef.current || !slimeRef.current) return;

    // Reset animations first
    chestRef.current.resetChestAnimation();
    slimeRef.current.resetSlimeAnimation();

    // Wait a brief moment before playing the animation again
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Play chest animation
    await chestRef.current.playChestAnimation();

    // Pull gacha
    if (socket && !loadingSocket && accessGranted) {
      socket.emit("mint-gen-0-slime");
    }

    // Start slime animation after chest animation completes
    slimeRef.current.startSlimeAnimation();
  };

  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      socket.on("mint-slime-error", (msg: string) => {
        console.error(`${msg}`); //!!!!!!!!!!!!!!!!!!!!!!! change alerts to a separate event !!!!!!!!!!!!!!!!!!!!!!!
      });

      return () => {
        socket.off("mint-slime-error");
      };
    }
  }, [socket, loadingSocket, accessGranted]);

  return (
    <div className="gacha-page-container">
      <div className="inventory-page-content-wrapper">
        <div className="inventory-page-content-container">
          <div className="inv-container-label">Bank</div>
          <div className="balances-container">
            <div className="coin-balance">
              <img src={DittoCoinLogo} alt="Ditto Coin" className="coin-logo" />
              <span>
                {formatNumberWithSuffix(getTotalFormattedBalance(dittoBalance))}{" "}
                DITTO
              </span>
            </div>
            <div className="coin-balance">
              <img src={GoldCoinLogo} alt="Gold Coin" className="coin-logo" />
              <span>{formatNumberWithSuffix(userData.goldBalance)} GP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slime should be positioned above the chest */}
      <div className="slime-gacha-wrapper">
        <SlimeGachaAnimation ref={slimeRef} />
      </div>

      {/* Chest is positioned normally */}
      <TreasureChest ref={chestRef} />

      <button onClick={pullGachaDitto} className="rotate-button">
        Slime Gacha (5k DITTO)
      </button>
      <button
        onClick={() => {
          chestRef.current?.resetChestAnimation();
          slimeRef.current?.resetSlimeAnimation();
        }}
        className="reset-button"
      >
        Reset Both
      </button>
    </div>
  );
}

export default GachaPage;
