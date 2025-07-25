import { useState, useRef, useEffect } from "react";
import "./skill.css";

// Stat descriptions - you can update these later
const statDescriptions: { [key: string]: React.ReactNode } = {
  str: (
    <>
      Boosts your{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Max Melee Damage</span>,
      helping you hit harder with melee weapons. Also adds to{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Damage Reduction</span>,
      letting you take less damage from monsters with physical attacks.
    </>
  ),
  def: (
    <>
      Increases{" "}
      <span style={{ color: "var(--burnt-orange)" }}>HP Regen Rate</span> and{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Regen Amount</span>,
      helping you recover faster. Also adds to{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Damage Reduction</span> and{" "}
      <span style={{ color: "var(--burnt-orange)" }}>
        Magic Damage Reduction
      </span>
      , making you tougher overall.
    </>
  ),
  dex: (
    <>
      Improves{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Max Ranged Damage</span>{" "}
      for stronger ranged attacks. Also increases{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Evasion</span>, helping you
      dodge incoming hits.
    </>
  ),
  agi: (
    <>
      Raises your{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Crit Chance</span> and{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Crit Multiplier</span> for
      more devastating critical hits. Also boosts{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Accuracy</span> and{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Attack Speed</span>, making
      every move hit more often and faster.
    </>
  ),
  magic: (
    <>
      Powers up your{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Max Magic Damage</span>,
      enhancing damage from staves. Also increases{" "}
      <span style={{ color: "var(--burnt-orange)" }}>
        Magic Damage Reduction
      </span>{" "}
      to help resist damage from monsters with magic-based attacks.
    </>
  ),
  "HP LVL": (
    <>
      Raises your <span style={{ color: "var(--burnt-orange)" }}>Max HP</span>,
      giving you a bigger health pool. Also improves{" "}
      <span style={{ color: "var(--burnt-orange)" }}>HP Regen Rate</span> and{" "}
      <span style={{ color: "var(--burnt-orange)" }}>Regen Amount</span> for
      faster recovery over time.
    </>
  ),
};

interface SkillProps {
  skill: string;
  level: number;
  pointsToPump: number;
  setPointsToPump: React.Dispatch<React.SetStateAction<number>>;
  canIncrement: boolean;
  canDecrement: boolean;
}

function Skill(props: SkillProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const skillContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = () => {
    if (!skillContainerRef.current) return;

    const rect = skillContainerRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 120;

    let left = rect.right + 8;
    let top = rect.top - 8;

    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    if (left < 8) {
      left = 8;
    }

    if (top < 8) {
      top = 8;
    }

    if (top + tooltipHeight > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - 8;
    }

    setTooltipPosition({ top, left });
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculateTooltipPosition();
    setShowTooltip(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        skillContainerRef.current &&
        !skillContainerRef.current.contains(event.target as Node)
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
    <div className="skill-container" ref={skillContainerRef}>
      <div className="skill-name clickable" onClick={handleLabelClick}>
        {props.skill.toUpperCase()}
      </div>

      <div className="skill-level">
        {props.level + props.pointsToPump}
        {props.pointsToPump !== 0 && (
          <span
            style={{
              fontSize: "0.8em",
              marginLeft: "4px",
              color: props.pointsToPump > 0 ? "var(--muted-teal-green)" : "var(--deep-warm-red)",
            }}
          >
            ({props.pointsToPump > 0 ? "+" : ""}
            {props.pointsToPump})
          </span>
        )}
      </div>

      <div className="skill-buttons">
        <button
          className="skill-plus-button"
          disabled={!props.canDecrement}
          onClick={() => props.setPointsToPump((prev) => prev - 1)}
        >
          -
        </button>
        <button
          className="skill-plus-button"
          disabled={!props.canIncrement}
          onClick={() => props.setPointsToPump((prev) => prev + 1)}
        >
          +
        </button>
      </div>

      {showTooltip && (
        <div
          className="skill-tooltip"
          ref={tooltipRef}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="skill-tooltip-header">
            {props.skill.toUpperCase()}
          </div>
          <div className="skill-tooltip-content">
            {statDescriptions[props.skill] || "Description coming soon..."}
          </div>
        </div>
      )}
    </div>
  );
}

export default Skill;
