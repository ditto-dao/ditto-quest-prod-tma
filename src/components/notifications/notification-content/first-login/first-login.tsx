import "./first-login.css";
import DQLogo from "../../../../assets/images/general/dq-logo.png";
import { useEffect } from "react";
import { preloadImage } from "../../../../utils/helpers";
import { SlimeGachaPullRes } from "../../../../redux/socket/gacha/gacha-context";
import { Inventory } from "../../../../utils/types";

interface FirstLoginNotifProps {
  freeSlimes: SlimeGachaPullRes[];
  freeItems: Inventory[];
}

function FirstLoginNotification(props: FirstLoginNotifProps) {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [DQLogo];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="first-login-notification">
      <div className="first-login-notification-header">
        <img src={DQLogo} alt="DQ logo" />
        <div>
          Welcome to <br></br> Ditto Quest
        </div>
      </div>
      <div className="first-login-message">
        Your journey in the <span>Dittoverse</span> begins now.
      </div>
      <div className="first-login-message">
        To get you started, we've gifted you:
      </div>
      <div className="first-login-gift">
        <div className="gift-label">2 Random Slimes</div>
        <div className="first-login-slimes">
          {props.freeSlimes.map((slime, idx) => (
            <img
              key={idx}
              src={slime.slime.imageUri}
              alt={`Free Slime ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="first-login-gift">
        <div className="gift-label">30 Barkwood</div>
        <div className="first-login-slimes">
          {props.freeItems.map((item, idx) => (
            <img
              key={idx}
              src={item.item?.imgsrc}
              alt={`Free Item ${idx + 1}`}
              className="free-item"
            />
          ))}
        </div>
      </div>
      <div className="first-login-message">
        Farm, Craft, Breed and Battle your way to greatness. <span>Let the adventure begin!</span>
      </div>
    </div>
  );
}

export default FirstLoginNotification;
