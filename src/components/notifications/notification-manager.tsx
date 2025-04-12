import { FC } from "react";
import { useNotification } from "./notification-context";
import Modal from "react-modal";
import "./notification-modal.css";

const NotificationManager: FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <>
      {notifications.map((notification) => (
        <Modal
          className="notification-content"
          overlayClassName="notification-overlay"
          isOpen={notification.isOpen}
          onRequestClose={() => removeNotification(notification.id)}
          key={notification.id}
          shouldCloseOnOverlayClick={false}
          style={{
            content: {
              width: notification.big ? "95%" : "80%",
              maxHeight: notification.big ? "95vh" : "80vh",
              overflow: "hidden",
            },
          }}
        >
          <div className="inner-notification-container">
            <div id="close-button-container">
              <div
                className="close-button"
                onClick={() => removeNotification(notification.id)}
              >
                X
              </div>
            </div>
            {notification.content}
          </div>
        </Modal>
      ))}
    </>
  );
};

export default NotificationManager;
