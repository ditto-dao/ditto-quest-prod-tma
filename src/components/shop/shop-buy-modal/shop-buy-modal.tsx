import { useEffect, useState } from "react";
import "./shop-buy-modal.css";
import GPIcon from "../../../assets/images/general/gold-coin.png";
import { formatMaxDigits } from "../../../utils/helpers";
import FastImage from "../../fast-image/fast-image";
import { ShopItemData } from "../../../utils/types";
import DittoCoinIcon from "../../../assets/images/general/ditto-coin.png";
import StarsIcon from "../../../assets/images/general/tg-stars.png";
import { formatUnits } from "ethers";
import { DITTO_DECIMALS } from "../../../utils/config";

interface ShopBuyModalProps {
  item: ShopItemData;
  priceGp: number;
  priceDitto: string;
  priceStars: number;
  onBuyGp: (shopItemId: number, quantity?: number) => void;
  onBuyDitto: (
    shopItemId: number,
    shopItemPriceDittoWei: bigint,
    quantity?: number
  ) => void;
  onBuyStars: (shopItemId: number, quantity?: number) => void;
  gpBalance: number;
  dittoBalance: bigint;
  onClose: () => void;
  getItemName: () => string;
  allowMultiple: boolean;
}

function ShopBuyModal({
  item,
  priceGp,
  priceDitto,
  priceStars,
  onBuyGp,
  onBuyDitto,
  onBuyStars,
  gpBalance,
  dittoBalance,
  onClose,
  getItemName,
  allowMultiple,
}: ShopBuyModalProps) {
  const [buyAmount, setBuyAmount] = useState(1);
  const [dynamicMax, setDynamicMax] = useState(1); // Only used for STARS

  const [selectedCurrency, setSelectedCurrency] = useState<
    "GP" | "DITTO" | "STARS"
  >("GP");
  const [totalPrice, setTotalPrice] = useState(0);

  // Get available currencies
  const getAvailableCurrencies = (): ("GP" | "DITTO" | "STARS")[] => {
    const currencies: ("GP" | "DITTO" | "STARS")[] = [];
    if (priceGp > 0) currencies.push("GP");
    if (priceDitto !== "0") currencies.push("DITTO");
    if (priceStars && priceStars > 0) currencies.push("STARS");
    return currencies;
  };

  const availableCurrencies = getAvailableCurrencies();

  // Set default currency to first available
  useEffect(() => {
    if (selectedCurrency === "STARS") {
      setDynamicMax(1); // Reset to 1 when selecting STARS
      setBuyAmount(1);
    } else {
      setBuyAmount(Math.min(1, getMaxAffordable(selectedCurrency)));
    }
  }, [selectedCurrency]);

  // Calculate max affordable amount
  const getMaxAffordable = (currency: "GP" | "DITTO" | "STARS"): number => {
    switch (currency) {
      case "GP":
        return Math.floor(gpBalance / priceGp);
      case "DITTO":
        return Number(dittoBalance / BigInt(priceDitto));
      case "STARS":
        return dynamicMax;
      default:
        return 0;
    }
  };

  const maxAffordable = getMaxAffordable(selectedCurrency);

  // Update total price when amount or currency changes
  useEffect(() => {
    switch (selectedCurrency) {
      case "GP":
        setTotalPrice(buyAmount * priceGp);
        break;
      case "DITTO":
        setTotalPrice(
          parseFloat(
            formatUnits(
              BigInt(buyAmount) * BigInt(priceDitto),
              DITTO_DECIMALS
            )
          )
        );
        break;
      case "STARS":
        setTotalPrice(buyAmount * (priceStars || 0));
        break;
    }
  }, [buyAmount, selectedCurrency]);

  // Reset amount when currency changes
  useEffect(() => {
    setBuyAmount(Math.min(1, maxAffordable));
  }, [selectedCurrency]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(parseInt(e.target.value));
  };

  const handleMaxAmount = () => {
    setBuyAmount(maxAffordable);
  };

  const confirmPurchase = () => {
    if (selectedCurrency === "GP") {
      onBuyGp(item.id, buyAmount);
    } else if (selectedCurrency === "DITTO") {
      onBuyDitto(item.id, BigInt(priceDitto), buyAmount);
    } else if (selectedCurrency === "STARS") {
      onBuyStars(item.id, buyAmount);
    }
    onClose();
  };

  const getCurrencyIcon = (currency: "GP" | "DITTO" | "STARS") => {
    switch (currency) {
      case "GP":
        return <FastImage src={GPIcon} alt="GP" />;
      case "DITTO":
        return <FastImage src={DittoCoinIcon} alt="GP" />;
      case "STARS":
        return <FastImage src={StarsIcon} alt="GP" />;
    }
  };

  const formatPrice = (price: number, currency: "GP" | "DITTO" | "STARS") => {
    if (currency === "GP" || currency === "DITTO") {
      return formatMaxDigits(price, 6);
    }
    return price.toLocaleString();
  };

  const getCurrencySymbol = (currency: "GP" | "DITTO" | "STARS") => {
    switch (currency) {
      case "GP":
        return "GP";
      case "DITTO":
        return "DITTO";
      case "STARS":
        return "STARS";
    }
  };

  return (
    <div className="buy-modal-overlay" onClick={onClose}>
      <div className="buy-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="buy-notification">
          <div className="buy-message">
            Confirm buy {getItemName()} x{buyAmount}?
          </div>
          {/* Currency Selection Buttons */}
          <div className="buy-currency-buttons">
            {availableCurrencies.map((currency) => (
              <button
                key={currency}
                className={`buy-currency-button ${
                  selectedCurrency === currency ? "active" : ""
                }`}
                onClick={() => setSelectedCurrency(currency)}
                disabled={getMaxAffordable(currency) === 0}
              >
                {getCurrencyIcon(currency)}
                <span>{currency}</span>
              </button>
            ))}
          </div>

          {allowMultiple && (
            <div className="buy-slider-container">
              <div className="buy-slider-labels">
                <span className="buy-amount-display">{buyAmount}</span>
              </div>
              <input
                type="range"
                min="1"
                max={maxAffordable}
                value={buyAmount}
                onChange={handleSliderChange}
                className="buy-slider"
                disabled={maxAffordable === 0}
              />
              <div className="buy-quick-buttons">
                <div className="buy-quick-buttons">
                  {selectedCurrency === "STARS" && (
                    <>
                      <button
                        className="buy-quick-button"
                        onClick={() => {
                          setDynamicMax((prev) => prev + 1);
                          setBuyAmount((prev) => prev + 1);
                        }}
                      >
                        +1
                      </button>
                      <button
                        className="buy-quick-button"
                        onClick={() => {
                          setDynamicMax((prev) => prev + 10);
                          setBuyAmount((prev) => prev + 10);
                        }}
                      >
                        +10
                      </button>
                      <button
                        className="buy-quick-button"
                        onClick={() => {
                          setDynamicMax((prev) => prev + 100);
                          setBuyAmount((prev) => prev + 100);
                        }}
                      >
                        +100
                      </button>
                    </>
                  )}
                  {selectedCurrency !== "STARS" && (
                    <button
                      className="buy-quick-button"
                      onClick={handleMaxAmount}
                      disabled={
                        buyAmount === maxAffordable || maxAffordable === 0
                      }
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="buy-value">
            <div className="buy-value-img-container">
              {getCurrencyIcon(selectedCurrency)}
            </div>
            <div className="buy-value-amount">
              {formatPrice(totalPrice, selectedCurrency)}{" "}
              {getCurrencySymbol(selectedCurrency)}
            </div>
          </div>
          <button
            className="notif-buy-button"
            onClick={confirmPurchase}
            disabled={maxAffordable === 0 || buyAmount === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopBuyModal;
