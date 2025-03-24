import "./skill.css";

interface SkillProps {
  skill: string;
  level: number;
}

function Skill(props: SkillProps) {
  return (
    <div className="skill-container">
      <div className="skill-name">{props.skill.toUpperCase()}</div>

      <div className="skill-level">{props.level}</div>

      <div className="skill-buttons">
        <button className="skill-plus-button" disabled>
          -
        </button>
        <button className="skill-plus-button" disabled>
          +
        </button>
      </div>
    </div>
  );
}

export default Skill;