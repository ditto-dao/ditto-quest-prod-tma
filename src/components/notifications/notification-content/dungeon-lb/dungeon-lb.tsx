import Decimal from "decimal.js";
import "./dungeon-lb.css";
import { useSocket } from "../../../../redux/socket/socket-context";
import { useEffect, useRef, useState } from "react";
import {
  DUNGEON_LB_UPDATE_EVENT,
  GET_DUNGEON_LB,
} from "../../../../utils/events";
import { useLoginSocket } from "../../../../redux/socket/login/login-context";
import { useUserSocket } from "../../../../redux/socket/user/user-context";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import {
  delay,
  formatDecimalWithSuffix3sf,
  formatDuration,
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "../../../../utils/helpers";
import {
  preloadImagesBatch,
  preloadImageCached,
} from "../../../../utils/image-cache";
import FastImage from "../../../../components/fast-image/fast-image";
import TrophyIcon from "../../../../assets/images/general/trophy.png";
import MonsterIcon from "../../../../assets/images/combat/monster-icon.png";
import TimerIcon from "../../../../assets/images/general/timer.png";
import HPIcon from "../../../../assets/images/combat/hp-lvl.png";
import BattleIcon from "../../../../assets/images/combat/battle-icon.png";
import DQIcon from "../../../../assets/images/general/dq-logo.png";
import { AnimatePresence, motion } from "framer-motion";

export type DungeonLeaderboardEntry = {
  id: number;
  userId: string;
  dungeonId: number;
  monstersKilled: number;
  damageDealt: number;
  damageTaken: number;
  timeElapsedMs: number;
  runDate: Date;
  score: number;
  user: {
    telegramId: string;
    username: string | null;
    level: number;
    combat: {
      cp: Decimal;
    };
    equippedSlime: {
      imageUri: string;
    } | null;
  };
};

interface DungeonLbProps {
  dungeonName: string;
  dungeonId: number;
}

function DungeonLb({ dungeonId, dungeonName }: DungeonLbProps) {
  const { socket, loadingSocket } = useSocket();
  const { accessGranted } = useLoginSocket();
  const { canEmitEvent, setLastEventEmittedTimestamp } = useUserSocket();

  const [lbList, setLbList] = useState<DungeonLeaderboardEntry[]>([]);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [receivedFirstBatch, setReceivedFirstBatch] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [staticImagesLoaded, setStaticImagesLoaded] = useState(false);
  const containerRef = useRef<any>(null);

  const NUM_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);

  const preloadDynamicImages = async (entry: DungeonLeaderboardEntry) => {
    try {
      if (entry.user.equippedSlime?.imageUri) {
        await preloadImageCached(entry.user.equippedSlime.imageUri);
      }

      setLoadedMap((prev) => ({
        ...prev,
        [`${entry.userId}-${entry.id}`]: true,
      }));
    } catch (error) {
      console.error(`Failed to preload image for user ${entry.userId}:`, error);
      // Still mark as loaded to prevent infinite loading
      setLoadedMap((prev) => ({
        ...prev,
        [`${entry.userId}-${entry.id}`]: true,
      }));
    }
  };

  const handleScroll = () => {
    const el = containerRef.current?.getScrollElement?.();
    if (!el || loadingMore || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      const last = lbList[lbList.length - 1];
      if (last) {
        setLoadingMore(true);
        getDungeonLb(NUM_PER_PAGE, { id: last.id });
      }
    }
  };

  const getDungeonLb = (limit: number, cursor?: { id: number }) => {
    if (socket && canEmitEvent()) {
      socket.emit(GET_DUNGEON_LB, {
        dungeonId,
        limit,
        cursor,
      });
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Preload static icons once
  useEffect(() => {
    const preloadStaticImages = async () => {
      const staticIcons = [
        TrophyIcon,
        MonsterIcon,
        TimerIcon,
        HPIcon,
        BattleIcon,
        DQIcon,
      ];

      try {
        await preloadImagesBatch(staticIcons);
        setStaticImagesLoaded(true);
      } catch (error) {
        console.error(
          "Failed to preload some static leaderboard images:",
          error
        );
        setStaticImagesLoaded(true); // Still proceed
      }
    };

    preloadStaticImages();
  }, []);

  useEffect(() => {
    const loadInitialLeaderboard = async () => {
      await delay(800);
      getDungeonLb(NUM_PER_PAGE);
    };

    loadInitialLeaderboard();
  }, []);

  useEffect(() => {
    if (socket && !loadingSocket && accessGranted) {
      socket.on(
        DUNGEON_LB_UPDATE_EVENT,
        async (data: { lb: DungeonLeaderboardEntry[] }) => {
          const newEntries = data.lb.filter(
            (entry) => !lbList.some((e) => e.id === entry.id)
          );

          // Preload dynamic images for new entries in parallel
          const preloadPromises = newEntries.map(preloadDynamicImages);
          await Promise.allSettled(preloadPromises);

          setLbList((prev) => [...prev, ...newEntries]);
          setHasMore(newEntries.length === NUM_PER_PAGE);
          setLoadingMore(false);
          if (!receivedFirstBatch) setReceivedFirstBatch(true);
        }
      );

      return () => {
        socket.off(DUNGEON_LB_UPDATE_EVENT);
      };
    }
  }, [socket, loadingSocket, accessGranted, receivedFirstBatch]);

  return (
    <div className="dungeon-lb-notification">
      <div className="dungeon-lb-title">{dungeonName + " Leaderboard"}</div>
      <SimpleBar
        className="dungeon-lb-scrollbar"
        onScrollCapture={handleScroll}
        ref={containerRef}
        style={{ maxHeight: "300px" }}
      >
        <div className="lb-row-wrapper">
          {!receivedFirstBatch ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div className="lb-row shimmer-row" key={`shimmer-${index}`} />
            ))
          ) : lbList.length === 0 ? (
            <div className="lb-empty-message">
              No entries yet. Be the first to conquer this dungeon!
            </div>
          ) : (
            lbList.map((entry, index) => {
              const key = `${entry.userId}-${entry.id}`;
              const isExpanded = expandedRows.has(entry.id);
              const isLoaded = loadedMap[key] && staticImagesLoaded;

              return (
                <div key={key}>
                  {!isLoaded ? (
                    <div className="lb-row shimmer-row" />
                  ) : (
                    <>
                      <div
                        className={`lb-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleRow(entry.id)}
                      >
                        <div className="lb-rank-column">
                          <div className="lb-rank-inner">{index + 1}</div>
                        </div>
                        <div className="lb-full">
                          <div className="lb-full-main">
                            <div className="lb-detail-column">
                              <div className="lb-detail-upper">
                                <div className="lb-detail-image">
                                  <FastImage
                                    src={
                                      entry.user.equippedSlime?.imageUri ||
                                      DQIcon
                                    }
                                    alt="slime"
                                    fallback={DQIcon}
                                  />
                                </div>
                                <div
                                  className="lb-username"
                                  title={
                                    entry.user.username ||
                                    `User ${entry.userId}`
                                  }
                                >
                                  {entry.user.username ||
                                    `User ${entry.userId}`}
                                </div>
                              </div>
                              <div className="lb-badges">
                                <div className="lb-badge lvl-badge">
                                  Lvl {entry.user.level}
                                </div>
                                <div className="lb-badge cp-badge">
                                  CP{" "}
                                  {formatDecimalWithSuffix3sf(
                                    new Decimal(entry.user.combat.cp)
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="lb-score-column">
                              <div className="lb-trophy">
                                <FastImage src={TrophyIcon} alt="trophy" />
                              </div>
                              <div className="lb-score-value">
                                {entry.score > 99999
                                  ? formatNumberWithSuffix(
                                      Math.floor(entry.score)
                                    )
                                  : formatNumberWithCommas(
                                      Math.floor(entry.score)
                                    )}
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <AnimatePresence>
                              <motion.div
                                className="lb-expanded"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  height: { duration: 0.3, ease: "easeInOut" },
                                  opacity: { duration: 0.9, ease: "easeInOut" },
                                }}
                              >
                                <div className="lb-box">
                                  <div className="lb-box-top">
                                    <FastImage
                                      src={MonsterIcon}
                                      className="lb-box-icon"
                                      alt="Monsters Icon"
                                    />
                                    <span>Monsters</span>
                                  </div>
                                  <div className="lb-box-bottom">
                                    {entry.monstersKilled > 999
                                      ? formatNumberWithCommas(
                                          entry.monstersKilled
                                        )
                                      : entry.monstersKilled}
                                  </div>
                                </div>
                                <div className="lb-box">
                                  <div className="lb-box-top">
                                    <FastImage
                                      src={BattleIcon}
                                      className="lb-box-icon"
                                      alt="Damage Icon"
                                    />
                                    <span>DMG</span>
                                  </div>
                                  <div className="lb-box-bottom">
                                    {entry.damageDealt > 999999
                                      ? formatNumberWithSuffix(
                                          entry.damageDealt
                                        )
                                      : formatNumberWithCommas(
                                          entry.damageDealt
                                        )}
                                  </div>
                                </div>
                                <div className="lb-box">
                                  <div className="lb-box-top">
                                    <FastImage
                                      src={HPIcon}
                                      className="lb-box-icon"
                                      alt="HP Icon"
                                    />
                                    <span>HP</span>
                                  </div>
                                  <div className="lb-box-bottom">
                                    {"-" +
                                      (entry.damageTaken > 999999
                                        ? formatNumberWithSuffix(
                                            entry.damageTaken
                                          )
                                        : formatNumberWithCommas(
                                            entry.damageTaken
                                          ))}
                                  </div>
                                </div>
                                <div className="lb-box">
                                  <div className="lb-box-top">
                                    <FastImage
                                      src={TimerIcon}
                                      className="lb-box-icon"
                                      alt="Timer Icon"
                                    />
                                    <span>Time</span>
                                  </div>
                                  <div className="lb-box-bottom">
                                    {formatDuration(entry.timeElapsedMs / 1000)}
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SimpleBar>
    </div>
  );
}

export default DungeonLb;
