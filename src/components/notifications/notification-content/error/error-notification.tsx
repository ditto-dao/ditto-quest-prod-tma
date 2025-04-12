import "./error-notification.css";

interface ErrorNotificationProps {
  msg: string;
}

function ErrorNotification(props: ErrorNotificationProps) {
  return (
    <div className="error-notification">
      <div className="error-notificaation-header">Error</div>
      <div className="error-message">{props.msg}</div>
    </div>
  );
}

export default ErrorNotification;
