import "./gacha-page.css";
import TreasureChest from "./treasure-chest/treasure-chest";
import SlimeGachaAnimation from "./slime-gacha-animation/slime-gacha-animation";
import { useSocket } from "../../redux/socket/socket-context";
import { useLoginSocket } from "../../redux/socket/login/login-context";
import DittoCoinLogo from "../../assets/images/general/ditto-coin.png";
import {
  formatNumberWithSuffix,
  getDeductionPayloadToDevFunds,
  getTotalBalanceBNF,
} from "../../utils/helpers";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { LEDGER_UPDATE_BALANCE_EVENT } from "../../utils/events";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  SLIME_GACHA_PRICE_DITTO_WEI,
  SLIME_GACHA_PULL_TRX_NOTE,
} from "../../utils/trx-config";
import { useGachaSocket } from "../../redux/socket/gacha/gacha-context";
import { useEffect, useRef, useState } from "react";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../utils/config";
import BalancesDisplay from "../balances/balances";

function GachaPage() {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { dittoBalance } = useUserSocket();
  const {
    rollingSlime,
    setRollingSlime,
    setSlimeDrawn,
    slimeDrawn,
    slimeObjDrawn,
  } = useGachaSocket();

  // Track if animation should play initially
  const [shouldAnimate, setShouldAnimate] = useState(!rollingSlime);

  const containerRef = useRef<HTMLDivElement>(null); // Reference for fireworks
  const stampTextRef = useRef<HTMLDivElement>(null); // Reference for fireworks

  /*   const pullGachaGold = async () => {
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
  }; */

  const pullGachaDitto = async () => {
    // Pull gacha
    if (
      socket &&
      canEmitEvent() &&
      !loadingSocket &&
      accessGranted &&
      telegramId &&
      !rollingSlime
    ) {
      setRollingSlime(true);
      socket.emit(
        LEDGER_UPDATE_BALANCE_EVENT,
        getDeductionPayloadToDevFunds(
          telegramId.toString(),
          dittoBalance,
          SLIME_GACHA_PRICE_DITTO_WEI,
          SLIME_GACHA_PULL_TRX_NOTE
        )
      );
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const isButtonActive = () => {
    return (
      getTotalBalanceBNF(dittoBalance) > SLIME_GACHA_PRICE_DITTO_WEI &&
      !rollingSlime
    );
  };

  const fireworks = () => {
    if (!slimeObjDrawn?.rankPull) return; // Ensure rankPull exists

    const rankPull = slimeObjDrawn.rankPull.toLowerCase();
    const rankOrder = ["d", "c", "b", "a", "s"]; // Rank hierarchy

    // Determine index in the rank order
    const rankIndex = rankOrder.indexOf(rankPull);
    if (rankIndex === -1) return; // Invalid rank safeguard

    // Adjust number of bubbles dynamically
    const numBubbles = 150 + rankIndex * 30;

    // Color selection based on rank
    const allColors = ["#b0b0b0", "#8fbf71", "#5b9eea", "#ba78f9", "#f6b74c"];
    const colors = allColors.slice(0, rankIndex + 1); // Use up to the current rank index

    for (let i = 0; i < numBubbles; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble-firework");

      // Random position offset
      let targetX = Math.random() * 300 - 150; // -150px to 150px
      let targetY = Math.random() * 200 - 100; // -100px to 100px

      // Randomize color and size
      const size = 6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      bubble.style.setProperty("--random-x", `${targetX}px`);
      bubble.style.setProperty("--random-y", `${targetY}px`);
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.backgroundColor = color;

      if (containerRef.current) {
        containerRef.current.appendChild(bubble);

        // Ensure bubbles disappear after animation
        setTimeout(() => {
          bubble.remove();
        }, 1000); // Same as animation duration
      }
    }
  };

  const showStampText = () => {
    const comboText = document.createElement("div");
    comboText.classList.add("stamp-text"); // Base styling

    comboText.textContent = `${slimeObjDrawn?.rankPull} RANK!`;
    comboText.style.color = `var(--rarity-${slimeObjDrawn?.rankPull.toLowerCase()})`;

    if (stampTextRef.current) {
      // Append the combo text
      stampTextRef.current.appendChild(comboText);

      // Trigger the zoom-in and fade-in effect by adding the 'show' class
      setTimeout(() => {
        comboText.classList.add("show");
      }, 0); // Ensure the next frame triggers the transition

      // Trigger the fade-out before removing it
      setTimeout(() => {
        comboText.classList.add("fade-out"); // Trigger fade-out

        setTimeout(() => {
          comboText.remove(); // Remove after fade-out
        }, 500); // This matches the fade-out duration
      }, 800); // The combo text stays visible for 0.5 seconds before fading out
    }
  };

  useEffect(() => {
    if (slimeDrawn) {
      if (!shouldAnimate) {
        fireworks();
        showStampText();
        setTimeout(() => {
          setRollingSlime(false);
          setSlimeDrawn(null);
        }, 3000);
        setShouldAnimate(true);
        return; // Skip animation if rollingSlime was already true when mounted
      }

      setTimeout(() => {
        fireworks();
        showStampText();
        setTimeout(() => {
          setRollingSlime(false);
          setSlimeDrawn(null);
        }, 1000);
      }, 4000);
    }
  }, [slimeDrawn]);

  return (
    <div className="gacha-page-container" ref={stampTextRef}>
      <BalancesDisplay />

      {/* Slime should be positioned above the chest */}
      <div className="slime-gacha-wrapper" ref={containerRef}>
        <SlimeGachaAnimation />
      </div>

      {/* Chest is positioned normally */}
      <TreasureChest />

      <button
        onClick={pullGachaDitto}
        className="slime-gacha-ditto-button"
        disabled={!isButtonActive()}
      >
        <div>Draw Slime</div>
        <div className="button-coin-price">
          <img
            src={DittoCoinLogo}
            alt="Ditto Coin"
            className="button-coin-logo"
          />
          <span className="button-price-span">
            {formatNumberWithSuffix(
              parseFloat(
                formatUnits(
                  SLIME_GACHA_PRICE_DITTO_WEI.toString(),
                  DITTO_DECIMALS
                )
              )
            )}{" "}
            DITTO
          </span>
        </div>
      </button>
    </div>
  );
}

export default GachaPage;
