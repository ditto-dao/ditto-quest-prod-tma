import "./skill.css";

interface SkillProps {
  skill: string;
  net: number;
  level: number;
  buff: number;
}

function Skill(props: SkillProps) {
  return (
    <div className="skill-container">
      <div className="skill-name">{props.skill.toUpperCase()}</div>
      <div className="skill-level">{props.net}</div>
      <div className="skill-breakdown">
        ({props.level} + {props.buff})
      </div>
      <button className="skill-plus-button" disabled>
        +
      </button>
    </div>
  );
}

export default Skill;
