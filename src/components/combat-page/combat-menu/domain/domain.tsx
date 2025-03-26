import { useState } from "react";
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

function DomainMenuItem(props: Domain) {
  const { enterDomain } = useCombatSocket();
  const [isExpanded, setIsExpanded] = useState(false);

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
    enterDomain(props);
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
              <div>
                {formatUnits(props.entryPriceDittoWei, DITTO_DECIMALS)} DITTO
              </div>
            </div>
            <div className="domain-main-stat">
              <div className="domain-main-stat-header">
                <img src={GPIcon} />
                <div>Entry Price</div>
              </div>
              <div>{props.entryPriceGP} GP</div>
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
                    <div className="domain-monster-name">{monster.monster.name}</div>
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
