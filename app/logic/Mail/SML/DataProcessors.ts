import { SMLParseProcessor, SMLData } from "./SMLParseProcessor";
import { RegisterSMLProcessor } from "./RegisterSMLProcessor";
import { HTMLDataParseProcessor } from "./HTMLDataParseProcessor";
import { AmazonPurchaseProcessor } from "./AmazonPurchaseProcessor";

export function dataProcessorsHookup() {
  SMLParseProcessor.hookup();
  RegisterSMLProcessor.hookup();
  HTMLDataParseProcessor.hookup();
  AmazonPurchaseProcessor.hookup();
}
