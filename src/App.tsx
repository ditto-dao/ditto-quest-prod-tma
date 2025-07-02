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
import { IdleSkillSocketProvider } from "./redux/socket/idle/skill-context";
import { GachaSocketProvider } from "./redux/socket/gacha/gacha-context";
import { CombatSocketProvider } from "./redux/socket/idle/combat-context";
import { NotificationProvider } from "./components/notifications/notification-context";
import { CurrentActivityProvider } from "./redux/socket/idle/current-activity-context";
import { FloatingUpdateProvider } from "./redux/socket/idle/floating-update-context";
import SocketInactivityManager from "./redux/socket/socket-inactivity-manager";
import { MissionNotificationProvider } from "./components/missions/mission-context";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { MANIFEST_URL, REDIRECT_URL } from "./utils/config";
import { preloadStaticImages } from "./utils/image-cache";

//initEruda();
Modal.setAppElement("#root"); // Assuming your app's root element has the ID 'root'

function App() {
  useEffect(() => {
    preloadStaticImages();
  }, []);
  
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
        root.style.setProperty("--misty-teal", "#4FA99A");
        root.style.setProperty("--steel-blue", "#4682B4");
        root.style.setProperty("--ocean-blue", "#102A37");
        root.style.setProperty("--deep-forest-green", "#1E5B4F");
        root.style.setProperty("--muted-greenish-blue", "#1C4E57");
        root.style.setProperty("--melee", "#B5533A");
        root.style.setProperty("--ranged", "#4B6A47");
        root.style.setProperty("--magic", "#6D5ED2");
        root.style.setProperty("--muted-crimson", "#d27676");
        root.style.setProperty("--muted-brick", "#c67c55");
        root.style.setProperty("--muted-indigo", "#4e4b74");
        root.style.setProperty("--muted-slate", "#3f536c");

        // Rank Background Colors with Muted Tones
        root.style.setProperty(
          "--rarity-d",
          "#b0b0b0"
        ); /* Muted Gray for D rank */
        root.style.setProperty(
          "--rarity-c",
          "#8fbf71"
        ); /* Muted Green for C rank */
        root.style.setProperty(
          "--rarity-b",
          "#5b9eea"
        ); /* Muted Blue for B rank */
        root.style.setProperty(
          "--rarity-a",
          "#ba78f9"
        ); /* Muted Purple for A rank */
        root.style.setProperty(
          "--rarity-s",
          "#f6b74c"
        ); /* Muted Gold for S rank */
        root.style.setProperty("--rarity-ss", "#f6b74c");
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
    <TonConnectUIProvider
      manifestUrl={MANIFEST_URL}
      actionsConfiguration={{
        twaReturnUrl: REDIRECT_URL,
      }}
      uiPreferences={{
        theme: THEME.DARK,
      }}
    >
      <Provider store={store}>
        <NotificationProvider>
          <SocketProvider>
            <LoginSocketProvider>
              <FloatingUpdateProvider>
                <UserProvider>
                  <CurrentActivityProvider>
                    <IdleSkillSocketProvider>
                      <GachaSocketProvider>
                        <CombatSocketProvider>
                          <MissionNotificationProvider>
                            <MainPage />
                          </MissionNotificationProvider>
                          <SocketInactivityManager />
                        </CombatSocketProvider>
                      </GachaSocketProvider>
                    </IdleSkillSocketProvider>
                  </CurrentActivityProvider>
                </UserProvider>
              </FloatingUpdateProvider>
            </LoginSocketProvider>
          </SocketProvider>
        </NotificationProvider>
      </Provider>
    </TonConnectUIProvider>
  );
}

export default App;
