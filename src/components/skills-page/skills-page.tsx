import { useUserSocket } from "../../redux/socket/user/user-context";
import Skill from "./skill/skill";
import "./skills-page.css";

function SkillsPage() {
  const { userData } = useUserSocket();

  return (
    <div className="skill-page-container">
      <div className="skills-container">
        <div className="skills-header">Abilities</div>
        <div className="skills-inner-container">
          <Skill skill="str" level={userData.str} />
          <Skill skill="def" level={userData.def} />
          <Skill skill="dex" level={userData.dex} />
          <Skill skill="luk" level={userData.luk} />
          <Skill skill="magic" level={userData.magic} />
          <Skill skill="maxhp" level={userData.hpLevel} />
        </div>
      </div>
    </div>
  );
}

export default SkillsPage;
