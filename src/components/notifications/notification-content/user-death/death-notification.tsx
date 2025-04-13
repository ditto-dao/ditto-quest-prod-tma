import "./death-notification.css";
import Death from "../../../../assets/images/combat/death.png";
import { useEffect } from "react";
import { preloadImage } from "../../../../utils/helpers";

function DeathNotification() {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [Death];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="death-notification">
      <div className="death-notificaation-header">
        <img src={Death} alt="Fireworks" />
      </div>
      <div className="death-message">
        You have died...
      </div>
    </div>
  );
}

export default DeathNotification;
