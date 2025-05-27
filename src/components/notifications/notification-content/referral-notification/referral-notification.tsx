import { useEffect } from "react";
import Friends from "../../../../assets/images/general/referral-slimes.png";
import "./referral-notification.css";
import { preloadImage } from "../../../../utils/helpers";

interface ReferralSuccessNotificationProps {
  header: string;
  msg: string;
}

function ReferralSuccessNotification(props: ReferralSuccessNotificationProps) {
  useEffect(() => {
    const preloadAll = async () => {
      const staticImages = [Friends];

      await Promise.all(staticImages.map(preloadImage));
    };

    preloadAll();
  }, []);

  return (
    <div className="referral-notification">
      <div className="referral-header">{props.header}</div>
      <div className="referral-notification-img-container">
        <img src={Friends} alt="Friends" />
      </div>
      <div className="referral-message">{props.msg}</div>
    </div>
  );
}

export default ReferralSuccessNotification;
