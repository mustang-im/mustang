import { kMailAccounts } from './logins';
import { newAccountForProtocol } from '../../../logic/Mail/AccountsList/MailAccounts';
import { TLSSocketType } from '../../../logic/Mail/MailAccount';
import { DummyMailStorage } from '../../../logic/Mail/Store/DummyMailStorage';
import { kStandardPorts } from '../../../logic/Mail/AutoConfig/configInfo';
import { getDomainForEmailAddress } from '../../../logic/util/netUtil';
import { connectToBackend, stopBackend } from '../util/backend.test';
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
  acc.userRealname = config.username;
  acc.hostname = config.hostname ?? "imap." + getDomainForEmailAddress(acc.username);
  acc.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == TLSSocketType.TLS)?.port ?? 443;
  acc.url = config.url ?? "https://example.com";
  acc.storage = new DummyMailStorage();
  acc.contentStorage.clear();

  await acc.login(false);
});

afterAll(stopBackend);
