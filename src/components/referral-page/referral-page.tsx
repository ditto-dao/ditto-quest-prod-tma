import { useEffect, useState } from "react";
import "./referral-page.css";
import ReferralImage from "../../assets/images/general/referral-slimes.png";
import FriendsImage from "../../assets/images/general/friends.png";
import TreasureImage from "../../assets/images/general/treasure.png";
import DittoCoin from "../../assets/images/general/ditto-coin.png";
import {
	formatMaxDigits,
  formatNumberWithCommas,
  preloadImage,
} from "../../utils/helpers";
import { useSocket } from "../../redux/socket/socket-context";
import {
  READ_REFERRAL_CODE,
  READ_REFERRAL_CODE_RES,
  READ_REFERRAL_STATS,
  READ_REFERRAL_STATS_RES,
} from "../../utils/events";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS, DQ_TMA_LINK_PREFIX } from "../../utils/config";

interface ReferralStats {
  referrerUserId?: string | null;
  referrerExternal?: string | null;
  referrerUsername?: string | null;
  directRefereeCount: number;
  totalEarningsWei: bigint;
}

function ReferralPage() {
  const { socket } = useSocket();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralLinkLoaded, setReferralLinkLoaded] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    directRefereeCount: 0,
    totalEarningsWei: 0n,
  });
  const [referralStatsLoaded, setReferralStatsLoaded] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const iconsToPreload = [
      ReferralImage,
      FriendsImage,
      TreasureImage,
      DittoCoin,
    ];
    Promise.all(iconsToPreload.map(preloadImage)).then(() =>
      setImagesLoaded(true)
    );
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(DQ_TMA_LINK_PREFIX + referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  useEffect(() => {
    if (socket) {
      if (!referralLinkLoaded) {
        console.log("Emitting READ_REFERRAL_CODE");
        socket.emit(READ_REFERRAL_CODE);
      }

      if (!referralStatsLoaded) {
        console.log("Emitting READ_REFERRAL_STATS");
        socket.emit(READ_REFERRAL_STATS);
      }
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on(READ_REFERRAL_CODE_RES, (data: { referralCode: string }) => {
        setReferralLink(data.referralCode);
        if (!referralLinkLoaded) setReferralLinkLoaded(true);
      });

      socket.on(READ_REFERRAL_STATS_RES, (data: ReferralStats) => {
        console.log(
          `READ_REFERRAL_STATS_RES: ${JSON.stringify(data, null, 2)}`
        );

        setReferralStats(data);
        if (!referralStatsLoaded) setReferralStatsLoaded(true);
      });

      return () => {
        socket.off(READ_REFERRAL_CODE_RES);
        socket.off(READ_REFERRAL_STATS_RES);
      };
    }
  }, [socket]);

  return (
    <div className="referral-page">
      <div className="referral-page-image-container">
        <img src={ReferralImage} alt="Referral slimes" />
      </div>
      <div
        className={`referral-boost-badge ${
          referralStats.referrerUserId ? "active" : "inactive"
        }`}
      >
        {referralStats.referrerUserId
          ? "+10% Boost Active"
          : "+10% Boost Inactive"}
      </div>
      <div className="instructions-list">
        <div className="instructions-element">
          <div className="num">1</div>
          <div className="details">Share your referral code</div>
        </div>
        <div className="instructions-element">
          <div className="num">2</div>
          <div className="details">
            Your friends receive a <span>10%</span> DITTO earnings boost in
            combat
          </div>
        </div>
        <div className="instructions-element">
          <div className="num">3</div>
          <div className="details">
            You earn <span>1%</span> of all DITTO your friends earn from combat
          </div>
        </div>
      </div>
      <div className="my-referral-link">
        {imagesLoaded && referralLinkLoaded ? (
          <div className="my-referral-link-inner">
            <div className="my-referral-link-text">{referralLink}</div>
            <button className="copy-button" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <div className="referral-link-shimmer" />
        )}
      </div>

      <div className="stat-container">
        <div className="referral-stat-card">
          <div className="referral-stat-icon-wrapper">
            <div className="referral-stat-icon-circle">
              <img src={FriendsImage} id="friends-img" alt="Friends Icon" />
            </div>
          </div>
          <div className="referral-stat-value">
            {formatNumberWithCommas(referralStats.directRefereeCount)}
          </div>
          <div className="referral-stat-label">Referrees</div>
        </div>
        <div className="referral-stat-card">
          <div className="referral-stat-icon-wrapper">
            <div className="referral-stat-icon-circle">
              <img src={DittoCoin} alt="Ditto Coin Icon" />
            </div>
          </div>
          <div className="referral-stat-value">
            {formatMaxDigits(
              parseFloat(
                formatUnits(referralStats.totalEarningsWei, DITTO_DECIMALS)
              )
            )}
          </div>
          <div className="referral-stat-label">Earned</div>
        </div>
      </div>
    </div>
  );
}

export default ReferralPage;
