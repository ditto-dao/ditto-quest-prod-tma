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
          key={item.itemId}
          itemId={item.itemId}
          itemName={item.name}
          rarity={item.rarity}
          description={item.description}
          durationS={item.farmingDurationS}
          farmingStatus={farmingStatuses[item.itemId] || null}
          imgsrc={item.imgsrc}
        />
      ))}
    </div>
  );
}

export default FarmingPage;
