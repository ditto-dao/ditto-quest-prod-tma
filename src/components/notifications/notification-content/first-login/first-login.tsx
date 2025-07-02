import "./first-login.css";
import DQLogo from "../../../../assets/images/general/dq-logo.png";
import { useEffect, useState } from "react";
import { preloadImagesBatch } from "../../../../utils/image-cache";
import FastImage from "../../../../components/fast-image/fast-image";
import { SlimeGachaPullRes } from "../../../../redux/socket/gacha/gacha-context";
import { Inventory } from "../../../../utils/types";

interface FirstLoginNotifProps {
  freeSlimes: SlimeGachaPullRes[];
  freeItems: Inventory[];
}

function FirstLoginNotification(props: FirstLoginNotifProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadFirstLoginImages = async () => {
      // Static images
      const staticImages = [DQLogo];

      // Dynamic images from props
      const dynamicImages = [
        ...props.freeSlimes.map((slime) => slime.slime.imageUri),
        ...(props.freeItems
          .map((item) => item.item?.imgsrc)
          .filter(Boolean) as string[]),
      ];

      try {
        // Preload all images in parallel
        await preloadImagesBatch([...staticImages, ...dynamicImages]);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to preload some first login images:", error);
        setImagesLoaded(true); // Still proceed even if some images fail
      }
    };

    preloadFirstLoginImages();
  }, [props.freeSlimes, props.freeItems]);

  return (
    <div className="first-login-notification">
      <div className="first-login-notification-header">
        <FastImage src={DQLogo} alt="DQ logo" />
        <div>
          Welcome to <br></br> Ditto Quest
        </div>
      </div>
      <div className="first-login-message">
        Your journey in the <span>Dittoverse</span> begins now.
      </div>
      <div className="first-login-message">
        To get you started, we've gifted you:
      </div>
      <div className="first-login-gift">
        <div className="gift-label">2 Random Slimes</div>
        <div className="first-login-slimes">
          {imagesLoaded
            ? props.freeSlimes.map((slime, idx) => (
                <FastImage
                  key={idx}
                  src={slime.slime.imageUri}
                  alt={`Free Slime ${idx + 1}`}
                  fallback={DQLogo}
                />
              ))
            : // Show placeholders while images load
              Array.from({ length: props.freeSlimes.length }).map((_, idx) => (
                <div key={idx} className="slime-placeholder shimmer" />
              ))}
        </div>
      </div>
      <div className="first-login-gift">
        <div className="gift-label">30 Barkwood</div>
        <div className="first-login-slimes">
          {imagesLoaded
            ? props.freeItems.map((item, idx) => (
                <FastImage
                  key={idx}
                  src={item.item?.imgsrc || ""}
                  alt={`Free Item ${idx + 1}`}
                  className="free-item"
                  fallback={DQLogo}
                />
              ))
            : // Show placeholders while images load
              Array.from({ length: props.freeItems.length }).map((_, idx) => (
                <div key={idx} className="item-placeholder shimmer" />
              ))}
        </div>
      </div>
      <div className="first-login-message">
        Farm, Craft, Breed and Battle your way to greatness.{" "}
        <span>Let the adventure begin!</span>
      </div>
    </div>
  );
}

export default FirstLoginNotification;
