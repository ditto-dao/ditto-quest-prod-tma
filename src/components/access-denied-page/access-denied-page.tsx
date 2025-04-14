import "./access-denied-page.css";
import PanicSlime from "../../assets/images/general/panic-slime.png";
import { useEffect } from "react";
import { preloadImage } from "../../utils/helpers";

interface AccessDeniedPageProps {
  msg: string;
}

function AccessDeniedPage(props: AccessDeniedPageProps) {
  const {
    msg,
  } = props;

  useEffect(() => {
    const iconsToPreload = [PanicSlime];

    Promise.all(iconsToPreload.map(preloadImage)).then(() =>
      console.log(`loading page icon loaded`)
    );
  }, []);

  return (
    <div className="access-denied-page">
      <img className="access-denied-sprite" src={PanicSlime} alt="Access denied" />
      <div className="access-denied-text">
        {msg}.
      </div>
    </div>
  );
}

export default AccessDeniedPage;
