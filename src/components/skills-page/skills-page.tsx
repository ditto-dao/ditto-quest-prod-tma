import { useUserSocket } from "../../redux/socket/user/user-context";
import Skill from "./skill/skill";
import "./skills-page.css";

function SkillsPage() {
  const { userData } = useUserSocket();

  return (
    <div className="skill-page-container">
      <div className="skills-container">
      <div className="skills-header">Skills</div>
        <div className="skills-inner-container">
          <Skill
            skill="maxhp"
            net={userData.combat!.maxHp}
            level={userData.hpLevel * 10}
            buff={userData.combat!.maxHp - (userData.hpLevel * 10)}
          />
          <Skill
            skill="str"
            net={userData.combat!.str}
            level={userData.str}
            buff={userData.combat!.str - userData.str}
          />
          <Skill
            skill="dex"
            net={userData.combat!.dex}
            level={userData.dex}
            buff={userData.combat!.dex - userData.dex}
          />
          <Skill
            skill="def"
            net={userData.combat!.def}
            level={userData.def}
            buff={userData.combat!.def - userData.def}
          />
          <Skill
            skill="magic"
            net={userData.combat!.magic}
            level={userData.magic}
            buff={userData.combat!.magic - userData.magic}
          />
        </div>
      </div>
    </div>
  );
}

export default SkillsPage;
