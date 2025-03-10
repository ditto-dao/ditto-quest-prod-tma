import "./farming-page.css";
import farming from "../../assets/json/farming.json";
import { useIdleSocket } from "../../redux/socket/idle/idle-context";
import FarmingItem from "./farming-item/farming-item";

function FarmingPage() {
  const { farmingStatuses } = useIdleSocket();

  return (
    <div className="farming-page-container">
      {farming.map((item) => (
        <FarmingItem
          key={item.id}
          id={item.id}
          name={item.name}
          rarity={item.rarity}
          description={item.description}
          farmingLevelRequired={item.farmingLevelRequired}
          farmingDurationS={item.farmingDurationS}
          farmingExp={item.farmingExp}
          farmingStatus={farmingStatuses[item.id] || null}
          imgsrc={item.imgsrc}
        />
      ))}
    </div>
  );
}

export default FarmingPage;
