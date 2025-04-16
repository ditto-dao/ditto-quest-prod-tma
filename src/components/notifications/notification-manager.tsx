import { FC } from "react";
import { useNotification } from "./notification-context";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";
import "./notification-modal.css";

const NotificationManager: FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <AnimatePresence>
      {notifications.map((notification) =>
        notification.isOpen ? (
          <Modal
            key={notification.id}
            isOpen={notification.isOpen}
            onRequestClose={() => removeNotification(notification.id)}
            shouldCloseOnOverlayClick={true}
            className="notification-content"
            overlayClassName="notification-overlay"
            style={{
              content: {
                width: notification.big ? "95%" : "80%",
                maxHeight: notification.big ? "95vh" : "80vh",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
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
              <motion.div
                initial={{ opacity: 0  }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {notification.content}
              </motion.div>
            </div>
          </Modal>
        ) : null
      )}
    </AnimatePresence>
  );
};

export default NotificationManager;
