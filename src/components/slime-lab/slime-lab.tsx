import { useState, useEffect } from "react";
import "./slime-lab.css";
import { useUserSocket } from "../../redux/socket/user/user-context";
import { SlimeWithTraits } from "../../utils/types";
import SlimeLabInventory from "./slime-lab-inventory/slime-lab-inventory";
import SlimeLabBreedingPage from "./slime-lab-breeding/slime-lab-breeding";

function SlimeLabPage() {
  const { userData } = useUserSocket();
  const [slimes, setSlimes] = useState<SlimeWithTraits[]>([]);
  const [equippedSlimeId, setEquippedSlimeId] = useState<number>();
  const [activeTab, setActiveTab] = useState<"inventory" | "breed">(
    "inventory"
  );

  useEffect(() => {
    if (userData?.slimes && userData.slimes.length > 0) {
      setSlimes(userData.slimes);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.equippedSlime) {
      setEquippedSlimeId(userData.equippedSlime.id);
    }
  }, [userData]);

  return (
    <div id="slime-lab-container">
      {/* Tabs */}
      <div className="slime-lab-tabs">
        <div
          className={`tab-button ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory
        </div>
        <div
          className={`tab-button ${activeTab === "breed" ? "active" : ""}`}
          onClick={() => setActiveTab("breed")}
        >
          Breed
        </div>
      </div>

      {/* Conditional Rendering */}
      <div className="tab-content">
        {activeTab === "inventory" && (
          <SlimeLabInventory
            slimes={slimes}
            equippedSlimeId={equippedSlimeId}
          />
        )}
        {activeTab === "breed" && (
          <SlimeLabBreedingPage
          />
        )}
      </div>
    </div>
  );
}

export default SlimeLabPage;
