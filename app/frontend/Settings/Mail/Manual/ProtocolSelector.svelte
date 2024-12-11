<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<select value={config.protocol} required disabled={!isSetup}
  on:change={onProtocolChanged}
  class="protocol">
  {#each listMailProtocols() as protocol}
    <option value={protocol}>{labelForMailProtocol(protocol)}</option>
  {/each}
</select>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { newAccountForProtocol, listMailProtocols, labelForMailProtocol } from "../../../../logic/Mail/AccountsList/MailAccounts";

  /** in/out */
  export let config: MailAccount;
  export let isSetup: boolean;

  function onProtocolChanged(event: Event) {
    let el = event.target as HTMLSelectElement;
    let protocol = el.value;
    console.log("new protocol", protocol);
    let newConfig = newAccountForProtocol(protocol);
    newConfig.cloneFrom(config);
    newConfig.url = "";
    config = newConfig;
  }
</script>

<style>
  select.protocol {
    opacity: unset;
  }
  select {
    min-width: 7em;
  }
</style>
