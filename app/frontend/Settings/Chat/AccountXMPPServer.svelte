<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<grid>
  <label for="hostname">{$t`Server`}</label>
  <hbox class="value">{account.hostname}:{account.port}</hbox>
  <label for="username">{$t`Username JID`}</label>
  <hbox class="value">{account.username}@{account.serverDomain}</hbox>
</grid>

<script lang="ts">
  import type { XMPPAccount } from "../../../logic/Chat/XMPP/XMPPAccount";
  import { t } from "../../../l10n/l10n";

  export let account: XMPPAccount;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
