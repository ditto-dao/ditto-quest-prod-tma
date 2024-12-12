import "./skill.css";

interface SkillProps {
  skill: string;
  level: number;
  combat: number;
}

function Skill(props: SkillProps) {
  return (
    <div className="skill-container">
      <div className="skill-name">{props.skill.toUpperCase()}</div>
      <div className="skill-level">{props.level}</div>
      <div className="skill-breakdown">
        ({props.level} + {props.combat - props.level})
      </div>
      <button className="skill-plus-button" disabled>
        +
      </button>
    </div>
  );
}

export default Skill;
