import { useUserSocket } from "../../../redux/socket/user/user-context";
import "./player.css";

function Player() {
  const { userData } = useUserSocket();

  return (
    <div id="player-container">
      {/* Details Section */}
      <div className="player-details">
        {/* Name and Level */}
        <div className="name-level">
          <span className="username">{userData.username}</span>
          <span className="level">{userData.level}</span>
        </div>

        {/* HP Bar */}
        <div className="hp-bar">
          <span>HP</span>
          <div className="bar">
            <div className="fill" style={{ width: `100%` }}></div>
          </div>
        </div>

        {/* EXP Bar */}
        <div className="exp-bar">
          <span>EXP</span>
          <div className="bar">
            <div className="fill" style={{ width: `20%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
