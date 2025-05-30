import type { FileSharingAccount } from '../FileSharingAccount';
import { WebDAVAccount } from '../WebDAV/WebDAVAccount';
import { DummyFileStorage } from '../Store/DummyFileStorage';
import { NotReached } from '../../util/util';
import { ArrayColl, type Collection } from 'svelte-collections';
import { myHarddrive } from '../Harddrive/HarddriveAccount';

export function newFileSharingAccountForProtocol(protocol: string): FileSharingAccount {
  let account = _newFileSharingAccountForProtocol(protocol);
  account.storage = new DummyFileStorage();
  return account;
}

function _newFileSharingAccountForProtocol(protocol: string): FileSharingAccount {
  if (protocol == "webdav") {
    return new WebDAVAccount();
  }
  throw new NotReached(`Unknown file sharing account type ${protocol}`);
}

export async function readFileSharingAccounts(): Promise<Collection<FileSharingAccount>> {
  let accounts = new ArrayColl<FileSharingAccount>();
  accounts.add(myHarddrive);
  return accounts;
}
