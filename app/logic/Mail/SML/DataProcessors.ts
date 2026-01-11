import { SMLParseProcessor, SMLData } from "./SMLParseProcessor";
import { HTMLDataParseProcessor } from "./HTMLDataParseProcessor";
import { AmazonPurchaseProcessor } from "./AmazonPurchaseProcessor";

export function dataProcessorsHookup() {
  SMLParseProcessor.hookup();
  SMLData.hookup();
  HTMLDataParseProcessor.hookup();
  AmazonPurchaseProcessor.hookup();
}
