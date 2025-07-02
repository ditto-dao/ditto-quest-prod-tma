import { useEffect, useState } from "react";
import { Dungeon } from "../../../../utils/types";
import DittoCoinIcon from "../../../../assets/images/general/ditto-coin.png";
import GPIcon from "../../../../assets/images/general/gold-coin.png";
//import MonsterIcon from "../../../../assets/images/combat/monster-icon.png";
import GoldMedal from "../../../../assets/images/combat/gold-medal.png";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../../../utils/config";
import Expand from "../../../../assets/images/general/down.svg";
import Minimize from "../../../../assets/images/general/up.svg";
import "./dungeon.css";
import { useCombatSocket } from "../../../../redux/socket/idle/combat-context";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import { useNotification } from "../../../notifications/notification-context";
import EquipSlimeNotification from "../../../notifications/notification-content/equip-slime-error/equip-slime-error";
import {
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "../../../../utils/helpers";
import { preloadImagesBatch } from "../../../../utils/image-cache";
import FastImage from "../../../../components/fast-image/fast-image";
import PaywallNotification from "../../../notifications/notification-content/paywall/paywall-notification";
import LBIcon from "../../../../assets/images/general/leaderboard-icon.svg";
import DungeonLb from "../../../notifications/notification-content/dungeon-lb/dungeon-lb";

function DungeonMenuItem(props: Dungeon) {
  const { userData } = useUserSocket();
  const { enterDungeonGp, enterDungeonDitto } = useCombatSocket();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dynamicImagesLoaded, setDynamicImagesLoaded] = useState(false);
  const { addNotification, removeNotification } = useNotification();

  const [entryPriceDitto, setEntryPriceDitto] = useState(
    props.entryPriceDittoWei || "0"
  );
  const [entryPriceGp, setEntryPriceGp] = useState(
    props.entryPriceGP?.toString() || "0"
  );

  const getDungeonReqLvl = (dungeon: Dungeon): string => {
    const { minCombatLevel, maxCombatLevel } = dungeon;

    if (minCombatLevel == null && maxCombatLevel == null) {
      return "Any";
    }

    if (minCombatLevel != null && maxCombatLevel != null) {
      return `${minCombatLevel} - ${maxCombatLevel}`;
    }

    if (minCombatLevel != null) {
      return `≥ ${minCombatLevel}`;
    }

    return `≤ ${maxCombatLevel}`;
  };

  // Preload dynamic images from props (dungeon and monster images from backend)
  useEffect(() => {
    const preloadDungeonImages = async () => {
      const dynamicImages = [
        props.imgsrc, // Dungeon image from backend
        ...props.monsterSequence.map((monster) => monster.imgsrc), // Monster images from backend
      ].filter(Boolean) as string[];

      if (dynamicImages.length > 0) {
        try {
          await preloadImagesBatch(dynamicImages);
          setDynamicImagesLoaded(true);
        } catch (error) {
          console.error("Failed to preload some dungeon images:", error);
          setDynamicImagesLoaded(true); // Still proceed even if some images fail
        }
      } else {
        setDynamicImagesLoaded(true); // No dynamic images to load
      }
    };

    preloadDungeonImages();
  }, [props.imgsrc, props.monsterSequence]);

  useEffect(() => {
    if (props.entryPriceDittoWei) {
      const entryPriceDittoWeiNumber = Number(
        formatUnits(props.entryPriceDittoWei || "0", DITTO_DECIMALS)
      );
      if (entryPriceDittoWeiNumber < 1000000) {
        setEntryPriceDitto(formatNumberWithCommas(entryPriceDittoWeiNumber));
      } else {
        setEntryPriceDitto(formatNumberWithSuffix(entryPriceDittoWeiNumber));
      }
    } else {
      setEntryPriceDitto("0");
    }
  }, [props.entryPriceDittoWei]);

  useEffect(() => {
    if (props.entryPriceGP) {
      const entryPriceGpNumber = Number(props.entryPriceGP);
      if (entryPriceGpNumber < 1000000) {
        setEntryPriceGp(formatNumberWithCommas(entryPriceGpNumber));
      } else {
        setEntryPriceGp(formatNumberWithSuffix(entryPriceGpNumber));
      }
    } else {
      setEntryPriceGp("0");
    }
  }, [props.entryPriceGP]);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const isWithinLevelRange = (
    userLevel: number,
    minLevel: number | null,
    maxLevel: number | null
  ): boolean => {
    if (minLevel !== null && userLevel < minLevel) return false;
    if (maxLevel !== null && userLevel > maxLevel) return false;
    return true;
  };

  const handleEnterDungeon = () => {
    if (
      userData.equippedSlime &&
      userData.equippedSlimeId &&
      BigInt(props.entryPriceDittoWei ?? "0") === 0n &&
      props.entryPriceGP === 0
    ) {
      enterDungeonGp(props);
    } else if (userData.equippedSlime && userData.equippedSlimeId) {
      addNotification((id) => (
        <PaywallNotification
          notificationId={id}
          removeNotification={removeNotification}
          gpAmount={props.entryPriceGP || 0}
          dittoAmountWei={props.entryPriceDittoWei || "0"}
          message="Confirm fee to enter the dungeon."
          onUseGp={{ fn: enterDungeonGp, args: props }}
          onUseDitto={{ fn: enterDungeonDitto, args: props }}
        />
      ));
    } else {
      addNotification(() => <EquipSlimeNotification />);
    }
  };

  const handleOpenLb = () => {
    addNotification(() => (
      <DungeonLb dungeonName={props.name} dungeonId={props.id} />
    ));
  };

  return (
    <div className="dungeon-container">
      <div className="dungeon-level">{props.name}</div>
      <div className="dungeon-inner-container">
        <div className="dungeon-main-display">
          <div className="dungeon-img-container">
            {dynamicImagesLoaded ? (
              <FastImage src={props.imgsrc} alt={`${props.name} Dungeon`} />
            ) : (
              <div className="dungeon-image-placeholder shimmer" />
            )}
          </div>
          <div className="dungeon-stats">
            <div className="dungeon-main-stat">
              <div className="dungeon-main-stat-header">
                <FastImage src={GoldMedal} alt="Level Icon" />
                <div>Req. Lvl</div>
              </div>
              <div>{getDungeonReqLvl(props)}</div>
            </div>
            <div className="dungeon-main-stat">
              <div className="dungeon-main-stat-header">
                <FastImage src={DittoCoinIcon} alt="Ditto Coin" />
                <div>Entry Price</div>
              </div>
              <div>{entryPriceDitto} DITTO</div>
            </div>
            <div className="dungeon-main-stat">
              <div className="dungeon-main-stat-header">
                <FastImage src={GPIcon} alt="Gold Coin" />
                <div>Entry Price</div>
              </div>
              <div>{entryPriceGp} GP</div>
            </div>
          </div>
        </div>

        <div className="dungeon-header-info">
          <div className="dungeon-description">{props.description}</div>
          <div>
            <div className="dungeon-button-group">
              <button
                className="dungeon-button"
                onClick={handleEnterDungeon}
                disabled={
                  !isWithinLevelRange(
                    userData.level,
                    props.minCombatLevel,
                    props.maxCombatLevel
                  )
                }
              >
                Enter
              </button>
              <button className="lb-button" onClick={handleOpenLb}>
                <FastImage src={LBIcon} alt="Leaderboard Icon" />
              </button>
            </div>
            <div className="dungeon-expand-row">
              <FastImage
                src={isExpanded ? Minimize : Expand}
                onClick={toggleExpand}
                alt="Toggle Expand"
                className="expand-button"
              />
            </div>
          </div>
        </div>

        {/* Monster List */}
        <div
          className={`dungeon-monsters ${
            isExpanded ? "expanded" : "collapsed"
          }`}
        >
          {isExpanded && dynamicImagesLoaded && (
            <>
              <div className="dungeon-monsters-header">Monsters</div>
              {props.monsterSequence.map((monster, index) => {
                const isAlternate = index % 2 === 1;
                const isLast = index === props.monsterSequence.length - 1;
                const monsterClassName = `dungeon-monster ${
                  isAlternate ? "alternate" : ""
                } ${isLast ? "last-monster" : ""}`;

                return (
                  <div key={monster.id} className={monsterClassName}>
                    <FastImage src={monster.imgsrc} alt={monster.name} />
                    <div className="dungeon-monster-name">{monster.name}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DungeonMenuItem;
