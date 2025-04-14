import "./offline-progress-notification.css";
import { ProgressUpdate } from "../../../../redux/socket/idle/skill-context";
import {
  formatDuration,
  formatNumberWithCommas,
  formatNumberWithSuffix,
  preloadImage,
} from "../../../../utils/helpers";
import { formatUnits } from "ethers/utils";
import { DITTO_DECIMALS } from "../../../../utils/config";
import GoldMedalIcon from "../../../../assets/images/combat/gold-medal.png";
import HPLevelIcon from "../../../../assets/images/combat/hp-lvl.png";
import DittoCoinIcon from "../../../../assets/images/general/ditto-coin.png";
import GP from "../../../../assets/images/general/gold-coin.png";
import DeathIcon from "../../../../assets/images/combat/death.png";
import SleepySlime from "../../../../assets/images/general/sleepy-slime.png";
import CraftingIcon from "../../../../assets/images/sidebar/craft.png";
import FarmingIcon from "../../../../assets/images/sidebar/farm.png";
import Timer from "../../../../assets/images/general/timer.png";
import { useState, useEffect } from "react";

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

  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  const shimmerCount = updates.reduce((count, update) => {
    if (update.type === "combat") {
      const u = update.update;
      return (
        count +
        (u.userDied ? 1 : 0) +
        (u.monstersKilled?.length || 0) +
        (u.items?.length || 0) +
        (u.equipment?.length || 0) +
        (u.expGained ? 1 : 0) +
        (u.levelsGained ? 1 : 0) +
        (u.hpExpGained ? 1 : 0) +
        (u.hpLevelsGained ? 1 : 0) +
        (u.dittoGained && u.dittoGained !== "0" ? 1 : 0) +
        (u.goldGained && u.goldGained > 0 ? 1 : 0)
      );
    }

    if (update.type === "farming") {
      const u = update.update;
      return (
        count +
        (u.items?.filter((i) => i.quantity !== 0).length || 0) +
        (u.farmingLevelsGained ? 1 : 0) +
        (u.farmingExpGained ? 1 : 0)
      );
    }

    if (update.type === "crafting") {
      const u = update.update;
      return (
        count +
        (u.equipment?.filter((e) => e.quantity !== 0).length || 0) +
        (u.items?.filter((i) => i.quantity !== 0).length || 0) +
        (u.craftingLevelsGained ? 1 : 0) +
        (u.craftingExpGained ? 1 : 0)
      );
    }

    if (update.type === "breeding") {
      return count + (update.update.slimes?.length || 0);
    }

    return count;
  }, 0);

  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [
        GoldMedalIcon,
        HPLevelIcon,
        DittoCoinIcon,
        GP,
        DeathIcon,
        SleepySlime,
        CraftingIcon,
        FarmingIcon,
        Timer,
      ];

      const dynamicImages = updates.flatMap((update) => {
        if (update.type === "combat") {
          const { monstersKilled, items, equipment } = update.update;
          return [
            ...(monstersKilled?.map((m) => m.uri) || []),
            ...(items?.map((i) => i.uri) || []),
            ...(equipment?.map((e) => e.uri) || []),
          ];
        }
        if (update.type === "farming") {
          return update.update.items?.map((i) => i.uri) || [];
        }
        if (update.type === "crafting") {
          return [
            ...(update.update.equipment?.map((e) => e.uri) || []),
            ...(update.update.items?.map((i) => i.uri) || []),
          ];
        }
        if (update.type === "breeding") {
          return update.update.slimes?.map((s) => s.imageUri) || [];
        }
        return [];
      });

      const uniqueImages = Array.from(
        new Set([...staticImages, ...dynamicImages])
      );
      await Promise.all(uniqueImages.map(preloadImage));
      setImagesPreloaded(true);
    };

    preloadAll();
  }, [updates]);

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
        goldGained,
      } = update.update;

      if (userDied) {
        combatLines.push(
          renderLine(DeathIcon, `You died`)
        );
      }

      monstersKilled?.forEach((monster) => {
        combatLines.push(
          renderLine(
            monster.uri,
            `${monster.name} ×${formatNumberWithCommas(monster.quantity)}`
          )
        );
      });

      items?.forEach((item) => {
        combatLines.push(
          renderLine(
            item.uri,
            `${item.itemName} +${formatNumberWithCommas(item.quantity)}`
          )
        );
      });

      equipment?.forEach((eq) => {
        combatLines.push(
          renderLine(
            eq.uri,
            `${eq.equipmentName} +${formatNumberWithCommas(eq.quantity)}`
          )
        );
      });

      if (expGained)
        combatLines.push(
          renderLine(GoldMedalIcon, `EXP +${formatNumberWithCommas(expGained)}`)
        );
      if (levelsGained)
        combatLines.push(renderLine(GoldMedalIcon, `LEVELS +${levelsGained}`));
      if (hpExpGained)
        combatLines.push(
          renderLine(
            HPLevelIcon,
            `HP EXP +${formatNumberWithCommas(hpExpGained)}`
          )
        );
      if (hpLevelsGained)
        combatLines.push(
          renderLine(HPLevelIcon, `HP LEVELS +${hpLevelsGained}`)
        );
      if (dittoGained && dittoGained !== "0")
        combatLines.push(
          renderLine(
            DittoCoinIcon,
            `DITTO +${formatNumberWithSuffix(
              parseInt(formatUnits(dittoGained, DITTO_DECIMALS))
            )}`
          )
        );
      if (goldGained && goldGained >= 0)
        combatLines.push(
          renderLine(GP, `GOLD +${formatNumberWithSuffix(goldGained)}`)
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
      update.update.items?.forEach((item) => {
        if (item.quantity !== 0) {
          farmingLines.push(
            renderLine(item.uri, `${item.itemName} ${item.quantity}`)
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
        breedingLines.push(renderLine(slime.imageUri, `Slime #${slime.id}`));
      }
    }
  });

  if (!imagesPreloaded) {
    return (
      <div className="offline-progress-notification">
        <div className="offline-progress-notification-header">
          <img src={SleepySlime} alt="Sleepy Slime" />
          <div>Welcome back!</div>
        </div>
        <div className="offline-progress-duration shimmer-duration">
          <div className="offline-progress-duration-label">
            <div className="invisible-img-placeholder" />
            <div className="invisible-text">Offline Progress</div>
          </div>
          <div className="invisible-text">
            {formatDuration(offlineProgressMs / 1000)}
          </div>
        </div>
        <div className="offline-progress-notification-content">
          {Array.from({ length: shimmerCount }).map((_, i) => (
            <div className="offline-progress-line" key={`shimmer-${i}`}>
              <div className="offline-progress-img shimmer-img" />
              <div className="offline-progress-text shimmer-text" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="offline-progress-notification">
      <div className="offline-progress-notification-header">
        <img src={SleepySlime} alt="Sleepy Slime" />
        <div>Welcome back!</div>
      </div>
      <div className="offline-progress-duration">
        <div className="offline-progress-duration-label">
          <img src={Timer}></img>
          <div>Offline Progress</div>
        </div>
        <div>{formatDuration(offlineProgressMs / 1000)}</div>
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
