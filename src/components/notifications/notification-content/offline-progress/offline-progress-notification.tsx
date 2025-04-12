import "./offline-progress-notification.css";
import { ProgressUpdate } from "../../../../redux/socket/idle/skill-context";
import { formatDuration } from "../../../../utils/helpers";
import { formatUnits } from "ethers/utils";
import { DITTO_DECIMALS } from "../../../../utils/config";
import GoldMedalIcon from "../../../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../../../assets/images/combat/hp-lvl.png";
import DittoCoinIcon from "../../../../assets/images/general/ditto-coin.png";
import DeathIcon from "../../../../assets/images/combat/death.png";
import SleepySlime from "../../../../assets/images/general/sleepy-slime.png";
import CraftingIcon from "../../../../assets/images/sidebar/craft.png";
import FarmingIcon from "../../../../assets/images/sidebar/farm.png";

interface OfflineProgressProps {
  updates: ProgressUpdate[];
  offlineProgressMs: number;
}

function OfflineProgressNotification(props: OfflineProgressProps) {
  const { updates, offlineProgressMs } = props;

  const renderLine = (imgSrc: string, label: string) => {
    const match = label.match(/(.+?)\s([+×]\d.*)$/); // match label + value
    const itemLabel = match ? match[1] : label;
    const value = match ? match[2] : "";

    return (
      <div className="offline-progress-line" key={`${imgSrc}-${label}`}>
        <img src={imgSrc} className="offline-progress-img" />
        <span className="offline-progress-text">
          <span className="label">{itemLabel}</span>
          {value && <span className="value">{value}</span>}
        </span>
      </div>
    );
  };

  const combatLines: JSX.Element[] = [];
  const farmingLines: JSX.Element[] = [];
  const craftingLines: JSX.Element[] = [];
  const breedingLines: JSX.Element[] = [];

  updates.forEach((update) => {
    if (update.type === "combat") {
      const {
        monstersKilled,
        items,
        equipment,
        expGained,
        levelsGained,
        hpExpGained,
        hpLevelsGained,
        dittoGained,
        userDied,
      } = update.update;

      if (userDied) {
        combatLines.push(
          renderLine(DeathIcon, `You died during offline combat`)
        );
      }

      monstersKilled?.forEach((monster) => {
        combatLines.push(
          renderLine(monster.uri, `${monster.name} ×${monster.quantity}`)
        );
      });

      items?.forEach((item) => {
        combatLines.push(
          renderLine(item.uri, `${item.itemName} +${item.quantity}`)
        );
      });

      equipment?.forEach((eq) => {
        combatLines.push(
          renderLine(eq.uri, `${eq.equipmentName} +${eq.quantity}`)
        );
      });

      if (expGained)
        combatLines.push(renderLine(GoldMedalIcon, `EXP +${expGained}`));
      if (levelsGained)
        combatLines.push(renderLine(GoldMedalIcon, `LEVELS +${levelsGained}`));
      if (hpExpGained)
        combatLines.push(renderLine(HPLevelIcon, `HP EXP +${hpExpGained}`));
      if (hpLevelsGained)
        combatLines.push(
          renderLine(HPLevelIcon, `+${hpLevelsGained} HP LEVELS`)
        );
      if (dittoGained && dittoGained !== "0")
        combatLines.push(
          renderLine(
            DittoCoinIcon,
            `DITTO +${formatUnits(dittoGained, DITTO_DECIMALS)}`
          )
        );
    }

    if (update.type === "farming") {
      update.update.items?.forEach((item) => {
        if (item.quantity !== 0) {
          farmingLines.push(
            renderLine(item.uri, `${item.itemName} +${item.quantity}`)
          );
        }
      });
      if (update.update.farmingLevelsGained)
        farmingLines.push(
          renderLine(
            FarmingIcon,
            `Farming Level +${update.update.farmingLevelsGained}`
          )
        );
      if (update.update.farmingExpGained)
        farmingLines.push(
          renderLine(
            FarmingIcon,
            `Farming EXP +${update.update.farmingExpGained}`
          )
        );
    }

    if (update.type === "crafting") {
      update.update.equipment?.forEach((eq) => {
        if (eq.quantity !== 0) {
          craftingLines.push(
            renderLine(eq.uri, `${eq.equipmentName} +${eq.quantity}`)
          );
        }
      });
      if (update.update.craftingLevelsGained)
        craftingLines.push(
          renderLine(
            CraftingIcon,
            `Crafting Level +${update.update.craftingLevelsGained}`
          )
        );
      if (update.update.craftingExpGained)
        craftingLines.push(
          renderLine(
            CraftingIcon,
            `Crafting EXP +${update.update.craftingExpGained}`
          )
        );
    }

    if (update.type === "breeding" && update.update.slimes) {
      for (const slime of update.update.slimes) {
        breedingLines.push(
          renderLine(
            slime.imageUri,
            `Slime #${slime.id} +1`
          )
        );
      }
    }
  });

  return (
    <div className="offline-progress-notification">
      <div className="offline-progress-notification-header">
        <img src={SleepySlime} alt="Sleepy Slime" />
        <div>Welcome back!</div>
      </div>
      <div className="offline-progress-duration">
        Offline Progress — {formatDuration(offlineProgressMs / 1000)}
      </div>
      <div className="offline-progress-notification-content">
        {combatLines.length > 0 && (
          <div className="offline-progress-section">{combatLines}</div>
        )}
        {farmingLines.length > 0 && (
          <div className="offline-progress-section">{farmingLines}</div>
        )}
        {craftingLines.length > 0 && (
          <div className="offline-progress-section">{craftingLines}</div>
        )}
        {breedingLines.length > 0 && (
          <div className="offline-progress-section">{breedingLines}</div>
        )}
      </div>
    </div>
  );
}

export default OfflineProgressNotification;
