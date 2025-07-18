import "./purchase-successful-notification.css";

interface PurchaseSuccessNotificationProps {
  msg: string;
}

function PurchaseSuccessNotification(props: PurchaseSuccessNotificationProps) {
  return (
    <div className="purchase-success-notification">
      <div className="purchase-success-header">Success</div>
      <div className="purchase-success-message">{props.msg}</div>
    </div>
  );
}

export default PurchaseSuccessNotification;
