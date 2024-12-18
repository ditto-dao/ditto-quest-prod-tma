import { Provider } from "react-redux";
import store from "./redux/store";
import "./App.css";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import Modal from "react-modal";
import { SocketProvider } from "./redux/socket/socket-context";
import { UserProvider } from "./redux/socket/user/user-context";
//import { initEruda } from "./utils/eruda";
import MainPage from "./components/main-page/main-page";
import { LoginSocketProvider } from "./redux/socket/login/login-context";
import { IdleSocketProvider } from "./redux/socket/idle/idle-context";

//initEruda();
Modal.setAppElement("#root"); // Assuming your app's root element has the ID 'root'

function App() {

  useEffect(() => {
    const root = document.documentElement;
    if (WebApp.colorScheme) {
      if (/* WebApp.colorScheme === 'dark' */ true) {
        root.style.setProperty("--deep-teal", "#1A3C40");
        root.style.setProperty("--dark-teal-green", "#204E4A");
        root.style.setProperty("--muted-teal-green", "#3C9168");
        root.style.setProperty("--emerald-green", "#2AA198");
        root.style.setProperty("--bright-teal", "#3DB4A2");
        root.style.setProperty("--forest-green", "#184E47");
        root.style.setProperty("--cream-white", "#F4F1DE");
        root.style.setProperty("--dark-navy", "#10212A");
        root.style.setProperty("--deep-navy-blue", "#112B30");
        root.style.setProperty("--golden-yellow", "#EFB950");
        root.style.setProperty("--burnt-orange", "#D97742");
        root.style.setProperty("--bright-cyan", "#4FC3F7");
        root.style.setProperty("--pine-green", "#234D32");
        root.style.setProperty("--sage-green", "#8FA68E");
        root.style.setProperty("--midnight-teal", "#113A4A");
        root.style.setProperty("--seafoam-green", "#6BBBA8");
        root.style.setProperty("--deep-warm-red", "#C23B3B");
        root.style.setProperty("--light-teal", "#2E7C78");
        root.style.setProperty("--medium-teal", "#1F5B58");
      } else {
      }
    }

    if (!WebApp.isExpanded) {
      WebApp.expand();
    }

    console.log(`height: ${WebApp.viewportHeight}`);
    console.log(`inner height: ${window.innerHeight}`);
    console.log(`width: ${window.innerWidth}`);

    if (!WebApp.isClosingConfirmationEnabled) {
      WebApp.enableClosingConfirmation();
    }
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider>
        <LoginSocketProvider>
          <UserProvider>
            <IdleSocketProvider>
              <MainPage />
            </IdleSocketProvider>
          </UserProvider>
        </LoginSocketProvider>
      </SocketProvider>
    </Provider>
  );
}

export default App;
