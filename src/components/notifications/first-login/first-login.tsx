import "./first-login.css";
import DQLogo from "../../../assets/images/general/dq-logo.png";
import { useEffect } from "react";
import { preloadImage } from "../../../utils/helpers";
import { SlimeGachaPullRes } from "../../../redux/socket/gacha/gacha-context";
import { Inventory } from "../../../utils/types";

interface FirstLoginNotifProps {
  freeSlimes: SlimeGachaPullRes[];
  freeItems: Inventory;
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
      <div className="first-login-notificaation-header">
        <img src={DQLogo} alt="DQ logo" />
        <div>Welcome to Ditto Quest Beta! {props.freeSlimes[0]?.slime.id}</div>
      </div>
      <div className="first-login-message">
        Go to <span>Slime Lab</span> {">"} <span>Inventory</span> and equip a slime first. If you do not own a slime, pull one from the <span>Gacha</span>.
      </div>
    </div>
  );
}

export default FirstLoginNotification;
