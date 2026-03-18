import { Observable, notifyChangedProperty } from "../../util/Observable";
import type { URLString } from "../../util/util";

export class ProductPurchase extends Observable {

  // Product
  @notifyChangedProperty
  productName: string;
  /** The product page at the shop or elsewhere. Not the order page. */
  @notifyChangedProperty
  productURL: URLString;
  /** EAN-13 European Article Number /
   * UPC-A Universal Product Code /
   * GTIN-12/13 */
  @notifyChangedProperty
  upc: string;

  // Shop
  /** E.g. "Amazon" or "Altman's phone shop" on eBay */
  @notifyChangedProperty
  shopName: string;
  /** E.g. "Amazon" or "eBay" */
  @notifyChangedProperty
  platformName: string | null = null;
  @notifyChangedProperty
  orderNumber: string;
  @notifyChangedProperty
  orderURL: URLString;

  // Price
  /** How many items of the product, in the same order or delivery */
  @notifyChangedProperty
  count: number = 1;
  /** Display string for the price per unit.
   * E.g. "12,53 €" */
  @notifyChangedProperty
  priceString: string;
  /** Price per unit as number, in currency.
   * E.g. 12.53 */
  @notifyChangedProperty
  priceInCurrency: number;
  /** 3-letter code */
  @notifyChangedProperty
  currency: string;
  /**
   * Offer was accepted, the order was made, and the buyer sent the money,
   * or gave the vendor all necessary data and authorizations to charge the money.
   *
   * In some jurisdictions, that means that the contract is binding for the vendor
   * and the vendor is obligated to deliver.
   *
   * Payment may happen at the same time as the order, before delivery, or after delivery,
   * depending on contract terms. */
  @notifyChangedProperty
  paid = false;

  // Delivery
  @notifyChangedProperty
  deliveryStatus = DeliveryStatus.Unknown;
  /** If `deliveryStatus == Delivered`, this the time when the product was handed to the buyer (past).
   * If `deliveryStatus == Sent` or `DeliveringToday`, this is the expected delivery time (future).
   * If unknown, this is unset. */
  @notifyChangedProperty
  deliveryTime: Date;
  @notifyChangedProperty
  deliveryTimeStr: string;
  /** E.g. "DHL", "USPS", "GLS", "Hermes", "PostNL" etc. */
  @notifyChangedProperty
  deliveryCompany: string;
  /** Tracking number at the delivery company, to see delivery status */
  deliveryTrackingNumber: string

  // Metadata
  /** Last time the information in here was updated, e.g. delivery date. */
  @notifyChangedProperty
  updated: Date;
  /** Any extra data to be stored */
  @notifyChangedProperty
  json: any;
}

export enum DeliveryStatus {
  Unknown = "unknown",
  /** Not yet ordered. Vendor or Buyer made an offer */
  Offer = "offer",
  /** Buyer accepted the vendor's offer and made a legally binding order.
   * Whether it's paid or not is a property on the purchase object.
   * This is normally the first stage in the purchase process. */
  Ordered = "ordered",
  /** Vendor handed the package to the delivery service */
  Sent = "sent",
  /** Delivery service announced the delivery for today */
  DeliveringToday = "delivering",
  /** The package was handed to the buyer/user.
   * This is normally the final stage. */
  Delivered = "delivered",
  /** Buyer sent back the product to the vendor, as reclamation */
  Returned = "returned",
  /** Vendor received the returned product back */
  ReturnReceived = "return-received",
}

export const gPurchases: ProductPurchase[] = [];
