// From <https://github.com/HenryLie/svelte-i18n-lingui/blob/main/src/lib/generateMessageId.js>

// Temporarily duplicate in package locally
// The package will be updated to use the same approach as here (js-sha256 instead of node's crypto so that it can run in the browser)

import { sha256 } from 'js-sha256';

const UNIT_SEPARATOR = '\u001F';

/**
 * @param {string} msg
 */
export function generateMessageId(msg, context = '') {
	return hexToBase64(sha256(msg + UNIT_SEPARATOR + (context || ''))).slice(0, 6);
}

/**
 * @param {string} hexStr
 */
function hexToBase64(hexStr) {
	let base64 = '';
	for (let i = 0; i < hexStr.length; i++) {
		base64 += !((i - 1) & 1)
			? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16))
			: '';
	}
	return btoa(base64);
}