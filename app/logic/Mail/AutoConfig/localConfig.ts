import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { SetupInfo } from "./SetupInfo";
import type { ArrayColl } from "svelte-collections";
import { assert } from "../../util/util";

export function localConfig(domain: string): ArrayColl<MailAccount> {
  let local = kLocalConfigs.find(c => c.domains.includes(domain));
  assert(local, "No local config found (expected)");
  let configs = readConfigFromXML(local.xml, domain, "local");
  for (let config of configs) {
    config.setup ??= new SetupInfo();
    config.setup.instructions = local.instructions;
  }
  return configs;
}

const kLocalConfigs = [
];
