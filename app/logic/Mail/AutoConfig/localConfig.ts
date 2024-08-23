import type { MailAccount, SetupInstruction } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import type { ArrayColl } from "svelte-collections";
import { assert } from "../../util/util";

export function localConfig(domain: string): ArrayColl<MailAccount> {
  let local = kLocalConfigs.find(c => c.domains.includes(domain));
  assert(local, "No local config found (expected)");
  let configs = readConfigFromXML(local.xml, domain, "local");
  for (let config of configs) {
    config.setupInstructions = local.instructions;
  }
  return configs;
}

const kLocalConfigs = [
];
