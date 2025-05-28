import { useEffect } from "react";
import Necklace from "../../../../assets/images/general/BetaNecklace.png";
import "./beta-testers-login.css";
import { preloadImage } from "../../../../utils/helpers";

function BetaTestersLoginNotif() {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [Necklace];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="beta-testers-login-notification">
      <div className="beta-testers-login-header">Welcome Back Pioneer</div>
      <div className="beta-testers-login-notification-img-container">
        <img src={Necklace} alt="Beta Necklace" />
      </div>
      <div className="beta-testers-login-message">You have received the <span>Pendant of Origin</span> for your contributions during Beta. Thank you for contributing to the Dittoverse!</div>
    </div>
  );
}

export default BetaTestersLoginNotif;
