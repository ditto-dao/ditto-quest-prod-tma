import Friends from "../../../../assets/images/general/referral-slimes.png";
import FastImage from "../../../fast-image/fast-image";
import "./referral-notification.css";

interface ReferralSuccessNotificationProps {
  header: string;
  msg: string;
}

function ReferralSuccessNotification(props: ReferralSuccessNotificationProps) {
  return (
    <div className="referral-notification">
      <div className="referral-header">{props.header}</div>
      <div className="referral-notification-img-container">
        <FastImage src={Friends} alt="Friends" />
      </div>
      <div className="referral-message">{props.msg}</div>
    </div>
  );
}

export default ReferralSuccessNotification;
