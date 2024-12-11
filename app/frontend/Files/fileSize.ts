// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import prettyBytes from 'pretty-bytes';
import { getUILocale } from '../../l10n/l10n';

export function fileSize(sizeInBytes: number) {
  return prettyBytes(sizeInBytes, {
    binary: true,
    locale: getUILocale(),
    maximumFractionDigits: 0,
  })
    .replace("i", "");
}
