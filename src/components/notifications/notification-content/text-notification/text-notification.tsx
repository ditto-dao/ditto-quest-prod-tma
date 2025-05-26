import "./text-notification.css";

interface TextNotificationProps {
  header: string;
  msg: string;
}

function TextNotification(props: TextNotificationProps) {
  return (
    <div className="text-notification">
      <div className="text-notificaation-header">{props.header}</div>
      <div className="text-message">{props.msg}</div>
    </div>
  );
}

export default TextNotification;
