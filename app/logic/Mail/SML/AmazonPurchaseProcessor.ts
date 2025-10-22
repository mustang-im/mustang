import { HTMLDataProcessor } from "./HTMLDataProcessor";

export abstract class AmazonPurchaseProcessor extends HTMLDataProcessor {
  fromDomains = [
    "amazon.com",
    "amazon.de",
    "amazon.fr",
    "amazon.it",
    "amazon.co.uk",
    "amazon.com.au",
  ];
  async processDOM(dom: Document): Promise<void> {
  }
}
