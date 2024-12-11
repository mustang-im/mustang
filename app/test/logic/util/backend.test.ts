// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import JPCWebSocket from '../../../../lib/jpc-ws/protocol';
import { appGlobal } from '../../../logic/app';

export async function connectToBackend() {
  let jpc = new JPCWebSocket(null);
  const kSecret = 'eyache5C';
  await jpc.connect(kSecret, "localhost", 5455);
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
}
