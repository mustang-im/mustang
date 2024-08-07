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
  {
    domains: ["hotmail.com", "outlook.com", "live.com", "msn.com", "windowslive.com",
      "outlook.at", "outlook.be", "outlook.cl", "outlook.cz", "outlook.de", "outlook.dk", "outlook.es",
      "outlook.fr", "outlook.hu", "outlook.ie", "outlook.in", "outlook.it", "outlook.jp", "outlook.kr",
      "outlook.lv", "outlook.my", "outlook.ph", "outlook.pt", "outlook.sa", "outlook.sg", "outlook.sk",
      "outlook.co.id", "outlook.co.il", "outlook.co.th", "outlook.com.ar", "outlook.com.au",
      "outlook.com.br", "outlook.com.gr", "outlook.com.tr", "outlook.com.vn",
      "hotmail.be", "hotmail.ca", "hotmail.cl", "hotmail.cz", "hotmail.de", "hotmail.dk", "hotmail.es",
      "hotmail.fi", "hotmail.fr", "hotmail.gr", "hotmail.hu", "hotmail.it", "hotmail.lt", "hotmail.lv",
      "hotmail.my", "hotmail.nl", "hotmail.no", "hotmail.ph", "hotmail.rs", "hotmail.se", "hotmail.sg",
      "hotmail.sk", "hotmail.co.id", "hotmail.co.il", "hotmail.co.in", "hotmail.co.jp", "hotmail.co.kr",
      "hotmail.co.th", "hotmail.co.uk", "hotmail.co.za", "hotmail.com.ar", "hotmail.com.au",
      "hotmail.com.br", "hotmail.com.hk", "hotmail.com.tr", "hotmail.com.tw", "hotmail.com.vn",
      "live.at", "live.be", "live.ca", "live.cl", "live.cn", "live.de", "live.dk", "live.fi", "live.fr", "live.hk",
      "live.ie", "live.in", "live.it", "live.jp", "live.nl", "live.no", "live.ru", "live.se", "live.co.jp", "live.co.kr",
      "live.co.uk", "live.co.za", "live.com.ar", "live.com.au", "live.com.mx", "live.com.my", "live.com.ph",
      "live.com.pt", "live.com.sg", "livemail.tw"],
    xml: `<clientConfig version="1.1">
  <emailProvider id="hotmail.com">
    <domain>hotmail.com</domain>
    <domain>outlook.com</domain>
    <domain>live.com</domain>
    <domain>msn.com</domain>
    <domain>windowslive.com</domain>
    <domain>outlook.at</domain>
    <domain>outlook.be</domain>
    <domain>outlook.cl</domain>
    <domain>outlook.cz</domain>
    <domain>outlook.de</domain>
    <domain>outlook.dk</domain>
    <domain>outlook.es</domain>
    <domain>outlook.fr</domain>
    <domain>outlook.hu</domain>
    <domain>outlook.ie</domain>
    <domain>outlook.in</domain>
    <domain>outlook.it</domain>
    <domain>outlook.jp</domain>
    <domain>outlook.kr</domain>
    <domain>outlook.lv</domain>
    <domain>outlook.my</domain>
    <domain>outlook.ph</domain>
    <domain>outlook.pt</domain>
    <domain>outlook.sa</domain>
    <domain>outlook.sg</domain>
    <domain>outlook.sk</domain>
    <domain>outlook.co.id</domain>
    <domain>outlook.co.il</domain>
    <domain>outlook.co.th</domain>
    <domain>outlook.com.ar</domain>
    <domain>outlook.com.au</domain>
    <domain>outlook.com.br</domain>
    <domain>outlook.com.gr</domain>
    <domain>outlook.com.tr</domain>
    <domain>outlook.com.vn</domain>
    <domain>hotmail.be</domain>
    <domain>hotmail.ca</domain>
    <domain>hotmail.cl</domain>
    <domain>hotmail.cz</domain>
    <domain>hotmail.de</domain>
    <domain>hotmail.dk</domain>
    <domain>hotmail.es</domain>
    <domain>hotmail.fi</domain>
    <domain>hotmail.fr</domain>
    <domain>hotmail.gr</domain>
    <domain>hotmail.hu</domain>
    <domain>hotmail.it</domain>
    <domain>hotmail.lt</domain>
    <domain>hotmail.lv</domain>
    <domain>hotmail.my</domain>
    <domain>hotmail.nl</domain>
    <domain>hotmail.no</domain>
    <domain>hotmail.ph</domain>
    <domain>hotmail.rs</domain>
    <domain>hotmail.se</domain>
    <domain>hotmail.sg</domain>
    <domain>hotmail.sk</domain>
    <domain>hotmail.co.id</domain>
    <domain>hotmail.co.il</domain>
    <domain>hotmail.co.in</domain>
    <domain>hotmail.co.jp</domain>
    <domain>hotmail.co.kr</domain>
    <domain>hotmail.co.th</domain>
    <domain>hotmail.co.uk</domain>
    <domain>hotmail.co.za</domain>
    <domain>hotmail.com.ar</domain>
    <domain>hotmail.com.au</domain>
    <domain>hotmail.com.br</domain>
    <domain>hotmail.com.hk</domain>
    <domain>hotmail.com.tr</domain>
    <domain>hotmail.com.tw</domain>
    <domain>hotmail.com.vn</domain>
    <domain>live.at</domain>
    <domain>live.be</domain>
    <domain>live.ca</domain>
    <domain>live.cl</domain>
    <domain>live.cn</domain>
    <domain>live.de</domain>
    <domain>live.dk</domain>
    <domain>live.fi</domain>
    <domain>live.fr</domain>
    <domain>live.hk</domain>
    <domain>live.ie</domain>
    <domain>live.in</domain>
    <domain>live.it</domain>
    <domain>live.jp</domain>
    <domain>live.nl</domain>
    <domain>live.no</domain>
    <domain>live.ru</domain>
    <domain>live.se</domain>
    <domain>live.co.jp</domain>
    <domain>live.co.kr</domain>
    <domain>live.co.uk</domain>
    <domain>live.co.za</domain>
    <domain>live.com.ar</domain>
    <domain>live.com.au</domain>
    <domain>live.com.mx</domain>
    <domain>live.com.my</domain>
    <domain>live.com.ph</domain>
    <domain>live.com.pt</domain>
    <domain>live.com.sg</domain>
    <domain>livemail.tw</domain>

    <displayName>Outlook</displayName>
    <displayShortName>Outlook</displayShortName>
    <incomingServer type="imap">
      <hostname>outlook.office365.com</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </incomingServer>
    <incomingServer type="pop3">
      <hostname>outlook.office365.com</hostname>
      <port>995</port>
      <socketType>SSL</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
      <pop3>
        <leaveMessagesOnServer>true</leaveMessagesOnServer>
        <!-- Outlook.com docs specifically mention that POP3 deletes have effect on the main inbox on webmail and IMAP -->
      </pop3>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>smtp.office365.com</hostname>
      <port>587</port>
      <socketType>STARTTLS</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </outgoingServer>
  </emailProvider>
</clientConfig>
`,
    instructions: [
      { url: `https://outlook.live.com/mail/0/options/mail/forwarding` },
      { instruction: `Forwarding and IMAP` },
      { instruction: `At the bottom, click "Sign-in"` },
      { instruction: `Enable: Let devices and apps use IMAP` },
      { enterPassword: true },
      { instruction: `Update: Microsoft decided to block IMAP apps and also block OAuth2 registrations. We are trying to resolve it with Microsoft, but communication with them is ... difficult.` },
    ] as SetupInstruction[],
  },
];
