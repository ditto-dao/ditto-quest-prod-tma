import "./combat-stat.css";

interface CombatStatProps {
  statName: string;
  imgsrc: string;
  level: number | string;
  fontSize: number;
}

function CombatStat(props: CombatStatProps) {
  const iconSize = props.fontSize + 10;

  return (
    <div className="combat-stat-container">
      <div className="combat-stat-left">
        <img
          src={props.imgsrc}
          alt={props.statName}
          className="combat-stat-icon"
          style={{ width: iconSize, height: iconSize }}
        />
        <div
          className="combat-stat-name"
          style={{ fontSize: `${props.fontSize}px` }}
        >
          {props.statName.toUpperCase()}
        </div>
      </div>
      <div
        className="combat-stat-level"
        style={{ fontSize: `${props.fontSize}px` }}
      >
        {props.level}
      </div>
    </div>
  );
}

export default CombatStat;