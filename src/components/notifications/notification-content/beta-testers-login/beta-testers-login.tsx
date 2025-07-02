import Necklace from "../../../../assets/images/general/BetaNecklace.png";
import "./beta-testers-login.css";
import FastImage from "../../../fast-image/fast-image";

function BetaTestersLoginNotif() {
  return (
    <div className="beta-testers-login-notification">
      <div className="beta-testers-login-header">Welcome Back Pioneer</div>
      <div className="beta-testers-login-notification-img-container">
        <FastImage src={Necklace} alt="Beta Necklace" />
      </div>
      <div className="beta-testers-login-message">
        You have received the <span>Pendant of Origin</span> for your
        contributions during Beta. Thank you for contributing to the Dittoverse!
      </div>
    </div>
  );
}

export default BetaTestersLoginNotif;
