import { newChatAccountForProtocol } from '../../../logic/Chat/AccountsList/ChatAccounts';
import { kChatAccounts } from './logins';
import { test } from 'vitest';

test.each(kChatAccounts)("Test $protocol account $username", async (config) => {
  if (config.disabled) { // <https://github.com/jestjs/jest/issues/7695>
    return;
  }
  let acc = newChatAccountForProtocol(config.protocol);
  acc.username = config.username;
  acc.password = config.password;
  acc.hostname = acc.hostname;

  await acc.login(false);
});
