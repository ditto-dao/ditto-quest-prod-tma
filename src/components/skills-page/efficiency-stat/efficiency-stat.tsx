import { useState, useRef, useEffect } from "react";
import "./efficiency-stat.css";

interface EfficiencyStatProps {
  statName: string;
  level: string | number;
  fontSize?: number;
}

// Efficiency stat descriptions
const efficiencyDescriptions: { [key: string]: React.ReactNode } = {
  "SKILL DURATION RED": (
    <>
      Reduces the duration for{" "}
      <span style={{ color: "var(--bright-cyan)" }}>farming</span> and{" "}
      <span style={{ color: "var(--bright-cyan)" }}>crafting</span>. Lower
      intervals mean faster resource gathering and experience gain.
    </>
  ),
  "DOUBLE RESOURCE CHANCE": (
    <>
      Chance to receive{" "}
      <span style={{ color: "var(--bright-cyan)" }}>double resources</span> for
      farming and crafting or{" "}
      <span style={{ color: "var(--bright-cyan)" }}>double drops</span> for
      combat.
    </>
  ),
  "DOUBLE SKILL EXP CHANCE": (
    <>
      Chance to gain{" "}
      <span style={{ color: "var(--bright-cyan)" }}>double EXP</span> for
      farming and crafting.
    </>
  ),
  "DOUBLE COMBAT EXP CHANCE": (
    <>
      Chance to gain{" "}
      <span style={{ color: "var(--bright-cyan)" }}>double EXP</span> from
      combat.
    </>
  ),
  "SKILL EXP BOOST": (
    <>
      Adds a <span style={{ color: "var(--bright-cyan)" }}>flat bonus</span> to
      all EXP gained from farming and crafting.
    </>
  ),
  "COMBAT EXP BOOST": (
    <>
      Adds a <span style={{ color: "var(--bright-cyan)" }}>flat bonus</span> to
      all combat EXP gained.
    </>
  ),
};

function EfficiencyStat({
  statName,
  level,
  fontSize = 8,
}: EfficiencyStatProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const statContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = () => {
    if (!statContainerRef.current) return;

    const rect = statContainerRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 120;

    let left = rect.right + 8;
    let top = rect.top - 8;

    // Check if tooltip would go off the right edge of the screen
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    // Make sure it doesn't go off the left edge either
    if (left < 8) {
      left = 8;
    }

    // Check if tooltip would go off the top edge of the screen
    if (top < 8) {
      top = 8;
    }

    // Check if tooltip would go off the bottom edge of the screen
    if (top + tooltipHeight > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - 8;
    }

    setTooltipPosition({ top, left });
  };

  const handleStatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculateTooltipPosition();
    setShowTooltip(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        statContainerRef.current &&
        !statContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    const handleScroll = () => {
      if (showTooltip) {
        calculateTooltipPosition();
      }
    };

    const handleResize = () => {
      if (showTooltip) {
        calculateTooltipPosition();
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [showTooltip]);

  return (
    <>
      <div
        className="efficiency-stat-wrapper clickable"
        ref={statContainerRef}
        onClick={handleStatClick}
      >
        <div className="efficiency-stat-info">
          <div
            className="efficiency-stat-name"
            style={{ fontSize: `${fontSize}px` }}
          >
            {statName}
          </div>
          <div className="efficiency-stat-level">{level}</div>
        </div>
      </div>

      {showTooltip && (
        <div
          className="efficiency-stat-tooltip"
          ref={tooltipRef}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="efficiency-stat-tooltip-header">{statName}</div>
          <div className="efficiency-stat-tooltip-content">
            {efficiencyDescriptions[statName] || "Description coming soon..."}
          </div>
        </div>
      )}
    </>
  );
}

export default EfficiencyStat;
