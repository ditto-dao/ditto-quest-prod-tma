import "./access-denied-page.css";
import DQLogo from "../../assets/images/general/dq-logo.png";
import { useEffect } from "react";
import { preloadImage } from "../../utils/helpers";

interface AccessDeniedPageProps {
  msg: string;
}

function AccessDeniedPageDQLogo(props: AccessDeniedPageProps) {
  const {
    msg,
  } = props;

  useEffect(() => {
    const iconsToPreload = [DQLogo];

    Promise.all(iconsToPreload.map(preloadImage)).then(() =>
      console.log(`loading page icon loaded`)
    );
  }, []);

  return (
    <div className="access-denied-page">
      <img className="access-denied-sprite" src={DQLogo} alt="Access denied" />
      <div className="access-denied-text">
        {msg}.
      </div>
    </div>
  );
}

export default AccessDeniedPageDQLogo;
