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
  {
    domains: ["gmail.com", "google.com", "googlemail.com"],
    xml: `<clientConfig version="1.1">
  <emailProvider id="googlemail.com">
    <domain>gmail.com</domain>
    <domain>googlemail.com</domain>
    <!-- MX, for Google Apps -->
    <domain>google.com</domain>

    <displayName>Google Mail</displayName>
    <displayShortName>GMail</displayShortName>

    <incomingServer type="imap">
      <hostname>imap.gmail.com</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
    </incomingServer>
    <incomingServer type="pop3">
      <hostname>pop.gmail.com</hostname>
      <port>995</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
      <pop3>
        <leaveMessagesOnServer>true</leaveMessagesOnServer>
      </pop3>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>smtp.gmail.com</hostname>
      <port>465</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
    </outgoingServer>
  </emailProvider>
</clientConfig>
`,
    instructions: [
      { url: `https://mail.google.com/mail/?ui=2&amp;shva=1#settings/fwdandpop` },
      { instruction: `Enable IMAP access` },
      { enterPassword: true },
    ] as SetupInstruction[],
  },
];
