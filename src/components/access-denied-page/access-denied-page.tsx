import "./access-denied-page.css";
import PanicSlime from "../../assets/images/general/panic-slime.png";
import FastImage from "../fast-image/fast-image";

interface AccessDeniedPageProps {
  msg: string;
}

function AccessDeniedPage({ msg }: AccessDeniedPageProps) {
  const showRefresh = msg.toLowerCase().includes("disconnect");

  return (
    <div className="access-denied-page">
      <FastImage
        className="access-denied-sprite"
        src={PanicSlime}
        alt="Access denied"
      />
      <div className="access-denied-text">{msg}.</div>
      {showRefresh && (
        <button
          className="access-denied-refresh-btn"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      )}
    </div>
  );
}

export default AccessDeniedPage;
