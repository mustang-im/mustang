import { kMailAccounts } from './logins';
import { newAccountForProtocol } from '../../../logic/Mail/AccountsList/MailAccounts';
import { Account, AuthMethod } from '../../../logic/Abstract/Account';
import { TLSSocketType } from '../../../logic/Abstract/TCPAccount';
import { OAuth2 } from '../../../logic/Auth/OAuth2';
import { OAuth2URLs } from '../../../logic/Auth/OAuth2URLs';
import { DummyMailStorage } from '../../../logic/Mail/Store/DummyMailStorage';
import { kStandardPorts } from '../../../logic/Mail/AutoConfig/configInfo';
import { getDomainForEmailAddress } from '../../../logic/util/netUtil';
import { connectToBackend, stopBackend } from '../util/backend.test';
import { assert } from '../../../logic/util/util';
import { afterAll, beforeAll, expect, test } from 'vitest';

beforeAll(connectToBackend);

test.each(kMailAccounts)("Test $protocol account $username", async (config) => {
  if (config.disabled) { // <https://github.com/jestjs/jest/issues/7695>
    return;
  }
  let acc = newAccountForProtocol(config.protocol);
  acc.username = config.username;
  acc.password = config.password;
  acc.name = config.username;
  acc.emailAddress = config.username;
  acc.realname = config.username;
  let domain = getDomainForEmailAddress(acc.username);
  acc.hostname = config.hostname ?? config.url ? new URL(config.url).hostname : "imap." + domain;
  acc.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == TLSSocketType.TLS)?.port ?? 443;
  acc.url = config.url ?? "https://example.com";
  acc.authMethod = config.authMethod ?? AuthMethod.Password;
  if (acc.authMethod == AuthMethod.OAuth2) {
    let urls = OAuth2URLs.find(o => o.hostnames.includes(acc.hostname ?? "") || o.domains.includes(domain));
    assert(urls, "Need OAuth2 config");
    acc.oAuth2 = new OAuth2(acc as any as Account, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID, urls.clientSecret, urls.doPKCE);
    if (config.accessToken) {
      acc.oAuth2.accessToken = config.accessToken;
    }
  }
  acc.storage = new DummyMailStorage();
  acc.contentStorage.clear();

  await acc.login(false);
  assert(acc.inbox, "Inbox not found");

  let newMsgs = await acc.inbox.listMessages();
  console.log("msgs", newMsgs.getIndexRange(0, 10).map(msg => msg.subject));

  let msg = newMsgs.first;
  if (msg) {
    await msg.download();
    console.log("body", msg.text);
  }
});

afterAll(stopBackend);
