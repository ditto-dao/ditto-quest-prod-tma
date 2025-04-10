import "./skill.css";

interface SkillProps {
  skill: string;
  level: number;
  pointsToPump: number;
  setPointsToPump: React.Dispatch<React.SetStateAction<number>>;
  canIncrement: boolean;
}

function Skill(props: SkillProps) {

  return (
    <div className="skill-container">
      <div className="skill-name">{props.skill.toUpperCase()}</div>

      <div className="skill-level">{props.level + props.pointsToPump}</div>

      <div className="skill-buttons">
        <button
          className="skill-plus-button"
          disabled={props.pointsToPump === 0}
          onClick={() => props.setPointsToPump((prev) => Math.max(prev - 1, 0))}
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
    </div>
  );
}

export default Skill;
