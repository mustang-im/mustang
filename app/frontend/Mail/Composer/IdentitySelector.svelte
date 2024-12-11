<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox class="identity-selector">
  <select bind:value={selectedIdentity}>
    {#each $identities.each as identity }
      <option value={identity}>
        {identity.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { selectedAccount } from "../Selected";
  import { appGlobal } from "../../../logic/app";

  export let selectedIdentity: MailIdentity; /* in/out */
   /** Which identities to select from.
    * Default: all identities of all accounts
    * in */
  export let identities: Collection<MailIdentity> = new ArrayColl(appGlobal.emailAccounts.contents.map(acc => acc.identities.contents).flat());
  /**
   * If any identity matches one of these emailAddresses,
   * select that identity by default.
   * In decreasing order of preference.
   * in */
  export let chooseFromPersons: PersonUID[];

  $: defaultSelection(chooseFromPersons, identities);
  function defaultSelection(_dummy: any, _dummy2: any) {
    for (let identity of identities) {
      for (let candidate of chooseFromPersons) {
        if (identity.isEMailAddress(candidate.emailAddress)) {
          selectedIdentity = identity;
        }
      }
    }
    if (!selectedIdentity) {
      selectedIdentity = $selectedAccount.identities.first;
    }
  }
</script>

<style>
  .identity-selector :global(select) {
    border: none;
    color: inherit;
    background-color: transparent;
  }
</style>
