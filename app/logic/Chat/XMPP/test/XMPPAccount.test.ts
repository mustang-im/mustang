import { XMPPAccount } from '../XMPPAccount';
import { kXMPPAccounts } from './XMPPAccount.test-data';
import { getDomainForEmailAddress } from '../../../util/netUtil';
import { stopBackend, startBackend } from './backend';
import { afterAll, beforeAll, expect, test } from 'vitest';

beforeAll(startBackend);

test.each(kXMPPAccounts)("XMPP connect to $username", async ({ username, password, disabled }) => {
  if (disabled) { // <https://github.com/jestjs/jest/issues/7695>
    return;
  }
  let acc = new XMPPAccount();
  acc.username = username;
  acc.password = password;
  acc.hostname = getDomainForEmailAddress(acc.username);
  await acc.login();
});

afterAll(stopBackend);
