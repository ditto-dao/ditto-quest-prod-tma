import { FC } from "react";
import { useNotification } from "./notification-context";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import "./notification-modal.css";

const NotificationManager: FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <>
      {notifications
        .filter((notification) => notification.isOpen)
        .map((notification) => (
          <Modal
            key={notification.id}
            isOpen={notification.isOpen}
            onRequestClose={() => removeNotification(notification.id)}
            shouldCloseOnOverlayClick={true}
            className="notification-content"
            overlayClassName="notification-overlay"
            style={{
              content: {
                width: notification.big ? "95%" : "82%",
                display: "flex",
                flexDirection: "column",
                padding: 0,
                background: "transparent", // ⚠️ Transparent so animation layer isn't masked
                overflow: "visible", // allow animation outside
              },
            }}
          >
            <AnimatePresence mode="wait">
              {notification.isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="animated-modal-content-wrapper" // 🧠 Custom class for layout
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
                    <SimpleBar
                      style={{
                        maxHeight: notification.big ? "95vh" : "80vh",
                      }}
                    >
                      {notification.content(notification.id)}
                    </SimpleBar>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Modal>
        ))}
    </>
  );
};

export default NotificationManager;
