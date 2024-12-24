import { formatNumberWithCommas } from "../../utils/helpers";
import "./stats.css";

interface StatsProps {
  level: number;
  total: number;
  progress: number;
}

function Stats(props: StatsProps) {
  return (
    <div className="stats-container">
      <div className="stats-level">
        <div className="stats-level-inner">
          <div className="level-text">{props.level}</div>
        </div>
      </div>
      <div className="stats-exp-container">
        <div className="stats-exp">
          <div
            className="stats-exp-progress"
            style={{ width: `${(props.progress / props.total) * 100}%` }}
          ></div>
        </div>
        <div className="stats-exp-text-container">
          <div className="stats-exp-text">
            XP {formatNumberWithCommas(props.progress)}/
            {formatNumberWithCommas(props.total)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
