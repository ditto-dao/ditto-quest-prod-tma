import { formatNumberWithCommas } from "../../utils/helpers";
import "./stats.css";

interface StatsProps {
  label: string;
  level: number;
  total: number;
  progress: number;
  secondaryColour?: string; // Optional prop for color override
  bgColour?: string; // Optional prop for color override
}

function Stats({ label, level, total, progress, secondaryColour, bgColour }: StatsProps) {
  const containerStyle = secondaryColour ? { backgroundColor: secondaryColour } : {};
  const textStyle = secondaryColour ? { backgroundColor: secondaryColour } : {};
  const bgStyle = bgColour ? { backgroundColor: bgColour } : {};

  return (
    <div className="stats-container-wrapper" style={containerStyle}>
      <div className="stats-container-label">{label}</div>
      <div className="stats-container-inner" style={bgStyle}>
        <div className="stats-level">
          <div className="stats-level-inner">
            <div className="level-text">{level}</div>
          </div>
        </div>
        <div className="stats-exp-container">
          <div className="stats-exp">
            <div
              className="stats-exp-progress"
              style={{ width: `${(progress / total) * 100}%` }}
            ></div>
          </div>
          <div className="stats-exp-text-container">
            <div className="stats-exp-text" style={textStyle}>
              XP {formatNumberWithCommas(progress)} / {formatNumberWithCommas(total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;