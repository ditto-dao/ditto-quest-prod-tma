import "./loading-page.css";
import LoadingSprite from "../../assets/images/general/dq-logo.png";
import { useEffect, useState } from "react";
import { delay, preloadImage } from "../../utils/helpers";

interface LoadingPageProps {
  socketDataLoadComplete: boolean;
  accessGranted: boolean;
  accessDeniedMessage: string;
  userContextLoaded: boolean;
  offlineProgressUpdatesReceived: boolean;
  onFinishLoading: (page: string) => void;
}

function LoadingPage(props: LoadingPageProps) {
  const {
    socketDataLoadComplete,
    userContextLoaded,
    offlineProgressUpdatesReceived,
    onFinishLoading,
  } = props;

  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressFlags, setProgressFlags] = useState({
    user: false,
    offline: false,
    socket: false,
  });

  useEffect(() => {
    const iconsToPreload = [LoadingSprite];

    Promise.all(iconsToPreload.map(preloadImage)).then(() =>
      console.log(`loading page icon loaded`)
    );
  }, []);

  useEffect(() => {
    const runInitialProgress = async () => {
      await delay(800);
      setProgress(15);
      await delay(1600);
      setProgress(30);
      setMinLoadingTimePassed(true);
    };

    if (!minLoadingTimePassed) runInitialProgress();
  }, [minLoadingTimePassed]);

  useEffect(() => {
    if (!minLoadingTimePassed) return;

    const flags = { ...progressFlags };
    let progressToAdd = 0;

    if (userContextLoaded && !flags.user) {
      flags.user = true;
      progressToAdd += 20;
    }
    if (offlineProgressUpdatesReceived && !flags.offline) {
      flags.offline = true;
      progressToAdd += 20;
    }
    if (socketDataLoadComplete && !flags.socket) {
      flags.socket = true;
      progressToAdd += 30;
    }

    if (progressToAdd > 0) {
      setProgress((prev) => prev + progressToAdd);
      setProgressFlags(flags);
    }
  }, [
    userContextLoaded,
    offlineProgressUpdatesReceived,
    socketDataLoadComplete,
    minLoadingTimePassed,
  ]);

  useEffect(() => {
    const handleSocketReady = async () => {
      if (
        progress >= 90 &&
        socketDataLoadComplete &&
        userContextLoaded &&
        offlineProgressUpdatesReceived
      ) {
        await delay(800);
        setProgress(100);
        setTimeout(() => {
          onFinishLoading('main');
        }, 400);
      }
    };
    handleSocketReady();
  }, [
    progress,
    socketDataLoadComplete,
    userContextLoaded,
    offlineProgressUpdatesReceived,
  ]);

  useEffect(() => {
    if (props.accessDeniedMessage.trim().length > 0 && !props.accessGranted) {
        onFinishLoading('access-denied');
    }
  }, [props.accessDeniedMessage, props.accessGranted]);

  return (
    <div className="loading-page">
      <img className="loading-sprite" src={LoadingSprite} alt="Loading" />
      <div className="loading-progress-container">
        <div
          className="loading-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default LoadingPage;
