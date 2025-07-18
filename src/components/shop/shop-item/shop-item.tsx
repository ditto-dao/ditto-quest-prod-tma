import "./shop-item.css";
import { useState } from "react";
import FastImage from "../../fast-image/fast-image";
import { useUserSocket } from "../../../redux/socket/user/user-context";
import ShopBuyModal from "../shop-buy-modal/shop-buy-modal";
import {
  DITTO_DECIMALS,
  MAX_INITIAL_INVENTORY_SLOTS,
  MAX_INITIAL_SLIME_INVENTORY_SLOTS,
} from "../../../utils/config";
import { ShopItemData } from "../../../utils/types";
import GPIcon from "../../../assets/images/general/gold-coin.png";
import DittoCoinIcon from "../../../assets/images/general/ditto-coin.png";
import {
  formatMaxDigits,
  getDeductionPayloadToDevFunds,
} from "../../../utils/helpers";
import { formatUnits } from "ethers";
import StarsIcon from "../../../assets/images/general/tg-stars.png";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useSocket } from "../../../redux/socket/socket-context";
import {
  CREATE_STARS_PURCHASE_EVENT,
  LEDGER_UPDATE_BALANCE_EVENT,
  PURCHASE_SHOP_ITEM_GP_EVENT,
} from "../../../utils/events";
import { generateShopPurchaseDittoTxNote } from "../../../utils/trx-config";

interface ShopItemProps {
  item: ShopItemData;
  allowMultiple: boolean;
}

const NUM_INVENTORY_SLOTS_PER_PURCHASE = 4;
const NUM_SLIME_INVENTORY_SLOTS_PER_PURCHASE = 2;

function ShopItem({ item, allowMultiple }: ShopItemProps) {
  const telegramId = useSelector((state: RootState) => state.telegramId.id);
  const { userData, dittoBalance, canEmitEvent, setLastEventEmittedTimestamp } =
    useUserSocket();
  const { socket } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate purchase count for inventory slot services
  const getInventorySlotPurchaseCount = (currentMaxSlots: number): number => {
    const extraSlots = currentMaxSlots - MAX_INITIAL_INVENTORY_SLOTS;
    return Math.max(0, Math.floor(extraSlots / NUM_INVENTORY_SLOTS_PER_PURCHASE));
  };

  const getSlimeInventorySlotPurchaseCount = (
    currentMaxSlots: number
  ): number => {
    const extraSlots = currentMaxSlots - MAX_INITIAL_SLIME_INVENTORY_SLOTS;
    return Math.max(0, Math.floor(extraSlots / NUM_SLIME_INVENTORY_SLOTS_PER_PURCHASE));
  };

  const buyGp = (shopItemId: number, quantity?: number) => {
    if (socket && canEmitEvent()) {
      socket.emit(PURCHASE_SHOP_ITEM_GP_EVENT, {
        shopItemId,
        quantity,
      });
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  const buyDitto = (
    shopItemId: number,
    shopItemPriceDittoWei: bigint,
    quantity?: number
  ) => {
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(
        LEDGER_UPDATE_BALANCE_EVENT,
        getDeductionPayloadToDevFunds(
          telegramId.toString(),
          dittoBalance,
          shopItemPriceDittoWei,
          generateShopPurchaseDittoTxNote(shopItemId, quantity || 1)
        )
      );
    }
  };

  const buyStars = (shopItemId: number, quantity?: number) => {
    if (socket && canEmitEvent() && telegramId) {
      socket.emit(CREATE_STARS_PURCHASE_EVENT, {
        userId: telegramId.toString(),
        shopItemId,
        quantity: quantity || 1,
      });
      setLastEventEmittedTimestamp(Date.now());
    }
  };

  // Calculate dynamic pricing for display
  const getDisplayPrice = (basePriceGP: number, basePriceDittoWei: string) => {
    if (!userData)
      return {
        gp: basePriceGP,
        ditto: basePriceDittoWei,
        stars: item.priceStars || 0,
      };

    let purchaseCount = 0;

    if (item.serviceType === "INVENTORY_SLOT") {
      purchaseCount = getInventorySlotPurchaseCount(userData.maxInventorySlots);
    } else if (item.serviceType === "SLIME_INVENTORY_SLOT") {
      purchaseCount = getSlimeInventorySlotPurchaseCount(
        userData.maxSlimeInventorySlots
      );
    }

    if (
      item.serviceType !== "INVENTORY_SLOT" &&
      item.serviceType !== "SLIME_INVENTORY_SLOT"
    ) {
      return {
        gp: basePriceGP,
        ditto: basePriceDittoWei,
        stars: item.priceStars || 0,
      };
    }

    // Apply 2x multiplier for each previous purchase
    const multiplier = Math.pow(2, purchaseCount);

    return {
      gp: Math.floor(basePriceGP * multiplier),
      ditto: (
        (BigInt(basePriceDittoWei) * BigInt(Math.floor(multiplier * 1000))) /
        BigInt(1000)
      ).toString(),
      stars: item.priceStars ? Math.floor(item.priceStars * multiplier) : 0,
    };
  };

  const displayPrices = getDisplayPrice(item.priceGP, item.priceDittoWei);

  const handleItemClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const isBuyButtonDisabled =
    !item.isActive ||
    ((item.type === "EQUIPMENT" || item.type === "ITEM") &&
      userData.maxInventorySlots === userData.inventory.length);

  return (
    <>
      <div className="shop-item-container">
        <div className="shop-item-wrapper">
          <div className="shop-item-content">
            <div className="shop-item-image-container">
              {item.imgsrc ? (
                <FastImage
                  src={item.imgsrc}
                  alt={item.name}
                  className="shop-item-image"
                />
              ) : (
                <div className="shop-item-placeholder">
                  <div
                    className={`placeholder-icon ${item.type.toLowerCase()}`}
                  ></div>
                </div>
              )}
            </div>

            <div className="shop-item-details">
              <div className="shop-item-header">
                <div className="shop-item-name">{item.name}</div>
              </div>
              <div className="shop-item-description">{item.description}</div>
            </div>
          </div>
          <div className="shop-item-prices">
            {displayPrices.gp > 0 && (
              <div className="price-display">
                <FastImage src={GPIcon} alt="GP" className="currency-icon" />
                <span>{formatMaxDigits(displayPrices.gp, 6)}</span>
              </div>
            )}
            {displayPrices.ditto !== "0" && (
              <div className="price-display">
                <FastImage
                  src={DittoCoinIcon}
                  alt="DITTO"
                  className="currency-icon"
                />{" "}
                <span>
                  {formatMaxDigits(
                    parseFloat(
                      formatUnits(displayPrices.ditto, DITTO_DECIMALS)
                    ),
                    6
                  )}
                </span>
              </div>
            )}
            {displayPrices.stars > 0 && (
              <div className="price-display">
                <FastImage
                  src={StarsIcon}
                  alt="Stars"
                  className="currency-icon"
                />
                <span>{formatMaxDigits(displayPrices.stars, 6)}</span>
              </div>
            )}
          </div>
          <div className="shop-item-actions">
            <div
              className={`click-to-buy ${
                isBuyButtonDisabled ? "disabled" : ""
              }`}
              onClick={() => {
                if (isBuyButtonDisabled) return;
                handleItemClick();
              }}
            >
              Buy
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ShopBuyModal
          item={item}
          priceGp={displayPrices.gp}
          priceDitto={displayPrices.ditto}
          priceStars={displayPrices.stars ? displayPrices.stars : 0}
          onBuyGp={buyGp}
          onBuyDitto={buyDitto}
          onBuyStars={buyStars}
          gpBalance={userData.goldBalance}
          dittoBalance={
            dittoBalance.liveBalance + dittoBalance.accumulatedBalance
          }
          onClose={handleModalClose}
          getItemName={() => item.name}
          allowMultiple={allowMultiple}
        />
      )}
    </>
  );
}

export default ShopItem;
