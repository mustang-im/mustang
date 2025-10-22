import { AmazonPurchaseProcessor } from "./AmazonPurchaseProcessor";

export function dataProcessorsHookup() {
  AmazonPurchaseProcessor.hookup();
}
