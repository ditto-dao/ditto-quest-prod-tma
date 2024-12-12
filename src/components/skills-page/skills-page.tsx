import { useUserSocket } from "../../redux/socket/user/user-context";
import Skill from "./skill/skill";
import "./skills-page.css";

function SkillsPage() {
  const { userData } = useUserSocket();

  return (
    <div className="skill-page-container">
      <Skill skill="hp" level={userData.hpLevel} combat={userData.combat!.hpLevel} />
      <Skill skill="str" level={userData.str} combat={userData.combat!.str} />
      <Skill skill="dex" level={userData.dex} combat={userData.combat!.dex} />
      <Skill skill="def" level={userData.def} combat={userData.combat!.def} />
      <Skill skill="magic" level={userData.magic} combat={userData.combat!.magic} />
    </div>
  );
}

export default SkillsPage;
