// From <https://github.com/HenryLie/svelte-i18n-lingui/blob/main/src/lib/generateMessageId.js>
// Copyright (c) 2023 Henry Roes Lie
// MIT License (MIT)

import { sha256 } from 'js-sha256';

const UNIT_SEPARATOR = '\u001F';

/**
 * @param {string} msg
 */
export function generateMessageID(msg: string, context = '') {
  return hexToBase64(sha256(msg + UNIT_SEPARATOR + (context || ''))).slice(0, 6);
}

/**
 * @param {string} hexStr
 */
function hexToBase64(hexStr: string) {
  let base64 = '';
  for (let i = 0; i < hexStr.length; i++) {
    base64 += !((i - 1) & 1)
      ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16))
      : '';
  }
  return btoa(base64);
}
