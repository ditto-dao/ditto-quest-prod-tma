import { useEffect, useState } from "react";
import { Domain } from "../../../../utils/types";
import DittoCoinIcon from "../../../../assets/images/general/ditto-coin.png";
import GPIcon from "../../../../assets/images/general/gold-coin.png";
import MonsterIcon from "../../../../assets/images/combat/monster-icon.png";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../../../utils/config";
import Expand from "../../../../assets/images/general/down.svg";
import Minimize from "../../../../assets/images/general/up.svg";
import "./domain.css";
import { useCombatSocket } from "../../../../redux/socket/idle/combat-context";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import { useNotification } from "../../../notifications/notification-context";
import EquipSlimeNotification from "../../../notifications/notification-content/equip-slime-error/equip-slime-error";
import {
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "../../../../utils/helpers";
import PaywallNotification from "../../../notifications/notification-content/paywall/paywall-notification";

function DomainMenuItem(props: Domain) {
  const { userData } = useUserSocket();
  const { enterDomainDitto, enterDomainGp } = useCombatSocket();
  const [isExpanded, setIsExpanded] = useState(false);
  const { addNotification, removeNotification } = useNotification();

  const [entryPriceDitto, setEntryPriceDitto] = useState(
    props.entryPriceDittoWei || "0"
  );
  const [entryPriceGp, setEntryPriceGp] = useState(
    props.entryPriceGP?.toString() || "0"
  );

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

  const getDomainLevelRange = (domain: Domain): string => {
    if (!domain.monsters || domain.monsters.length === 0) return "N/A";

    const levels = domain.monsters.map((m) => m.monster.level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);

    return `${min} - ${max}`;
  };

  const handleEnterDomain = () => {
    if (BigInt(props.entryPriceDittoWei) === 0n && props.entryPriceGP === 0) {
      enterDomainGp(props);
    } else if (userData.equippedSlime && userData.equippedSlimeId) {
      addNotification((id) => (
        <PaywallNotification
          notificationId={id}
          removeNotification={removeNotification}
          gpAmount={props.entryPriceGP || 0}
          dittoAmountWei={props.entryPriceDittoWei || "0"}
          message="Confirm fee to enter the domain."
          onUseGp={{ fn: enterDomainGp, args: props }}
          onUseDitto={{ fn: enterDomainDitto, args: props }}
        />
      ));
    } else {
      addNotification(() => <EquipSlimeNotification />);
    }
  };

  return (
    <div className="domain-container">
      <div className="domain-level">{props.name}</div>
      <div className="domain-inner-container">
        <div className="domain-main-display">
          <div className="domain-img-container">
            <img src={props.imgsrc} />
          </div>
          <div className="domain-stats">
            <div className="domain-main-stat">
              <div className="domain-main-stat-header">
                <img src={MonsterIcon} />
                <div>Monster Lvl</div>
              </div>
              <div>{getDomainLevelRange(props)}</div>
            </div>
            <div className="domain-main-stat">
              <div className="domain-main-stat-header">
                <img src={DittoCoinIcon} />
                <div>Entry Price</div>
              </div>
              <div>{entryPriceDitto} DITTO</div>
            </div>
            <div className="domain-main-stat">
              <div className="domain-main-stat-header">
                <img src={GPIcon} />
                <div>Entry Price</div>
              </div>
              <div>{entryPriceGp} GP</div>
            </div>
          </div>
        </div>

        <div className="domain-header-info">
          <div className="domain-description">{props.description}</div>
          <div>
            <button className="domain-button" onClick={handleEnterDomain}>
              Enter
            </button>
            <div className="domain-expand-row">
              <img
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
          className={`domain-monsters ${isExpanded ? "expanded" : "collapsed"}`}
        >
          {isExpanded && (
            <>
              <div className="domain-monsters-header">Monsters</div>
              {props.monsters.map((monster, index) => {
                const isAlternate = index % 2 === 1;
                const isLast = index === props.monsters.length - 1;
                const monsterClassName = `domain-monster ${
                  isAlternate ? "alternate" : ""
                } ${isLast ? "last-monster" : ""}`;

                return (
                  <div key={index} className={monsterClassName}>
                    <img
                      src={monster.monster.imgsrc}
                      alt={monster.monster.name}
                    />
                    <div className="domain-monster-name">
                      {monster.monster.name}
                    </div>
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

export default DomainMenuItem;
