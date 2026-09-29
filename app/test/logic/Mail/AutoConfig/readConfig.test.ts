// @vitest-environment happy-dom
import { readConfigFromXML } from "../../../../logic/Mail/AutoConfig/readConfig";
import { expect, test } from "vitest";

function userAccountXML(user: string): string {
  return `<clientConfig version="1.2">
  ${user}
  <emailProvider id="example.com">
    <domain>example.com</domain>
    <displayName>ExampleCorp</displayName>
    <incomingServer type="ews">
      <username>%EMAILADDRESS%</username>
      <authentication>NTLM</authentication>
      <url>https://exchange.example.com/ews/exchange.asmx</url>
    </incomingServer>
  </emailProvider>
</clientConfig>`;
}

test("useraccount.xml: <user> has the email address and name", () => {
  let config = readConfigFromXML(userAccountXML(`
    <user>
      <emailAddress>fred.flintstone@example.com</emailAddress>
      <realName>Fred Flintstone</realName>
    </user>`), null, "harddisk").first;
  expect(config.emailAddress).toBe("fred.flintstone@example.com");
  expect(config.realname).toBe("Fred Flintstone");
});

test("AutoConfig for the domain has no user", () => {
  let config = readConfigFromXML(userAccountXML(""), "example.com", "autoconfig-isp").first;
  expect(config.protocol).toBe("ews");
  expect(config.emailAddress).toBeFalsy();
  expect(config.realname).toBeFalsy();
});

