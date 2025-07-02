import "./open-dg-notification.css";
import DGSlime from "../../../../assets/images/general/loading-sprite.gif";
import FastImage from "../../../fast-image/fast-image";

function OpenDGNotification() {

  return (
    <div className="open-dg-notification">
      <div className="open-dg-notification-header">
        <FastImage src={DGSlime} alt="Ditto Guess slime" />
        <div>Ditto Guess (DG)</div>
      </div>
      <div className="open-dg-message">
        DG is our debut Accumulation Game, the first game launched in the Ditto
        Games Ecosystem.
      </div>
      <div className="open-dg-message">
        Head over to DG and complete daily tasks to earn DITTOX that can be
        spent in-game. Or for the risk-takers, wager your DITTO and multiply
        your earnings.
      </div>
      <div className="open-dg-message">
        Your DITTO balances are synced across the entire ecosystem.
      </div>
      <button
        className="open-dg-button"
        onClick={() => window.open("https://t.me/the_ditto_bot/ditto", "_blank")}
      >
        Open DG
      </button>
    </div>
  );
}

export default OpenDGNotification;
