<hbox class="identity-selector">
  {#if selectedIdentity.isCatchAll}
    <label for="customFrom">{$t`From`}</label>
    <input type="email" bind:value={customFromAddress}
      name="customFrom" spellcheck="false" />
  {/if}
  <select bind:value={selectedIdentity} class:catch-all={selectedIdentity.isCatchAll}>
    {#each $identities.each as identity }
      <option value={identity}>
        {identity.isCatchAll && identity.isEMailAddress(customFromAddress) && identity.emailAddress != customFromAddress
          ? customFromAddress
          : identity.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { appGlobal } from "../../../logic/app";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let selectedIdentity: MailIdentity; /* in/out */
   /** Which identities to select from.
    * Default: all identities of all accounts
    * in */
  export let identities: Collection<MailIdentity> = new ArrayColl(appGlobal.emailAccounts.contents.map(acc => acc.identities.contents).flat());
  /** Allows the user to override the From address with a custom email address.
   * This allows for catch-all email addresses to be used as From: */
  export let customFromAddress: string;

  $: $selectedIdentity?.isCatchAll && setCatchAll($selectedIdentity)
  function setCatchAll(identity: MailIdentity) {
    if (identity?.isCatchAll && !identity.isEMailAddress(customFromAddress)) {
      customFromAddress = identity.emailAddress;
    }
  }
</script>

<style>
  .identity-selector {
    align-items: center;
  }
  .identity-selector select {
    border: none;
    color: inherit;
    background-color: transparent;
  }
  label {
    margin-inline-end: 12px;
  }
  input {
    width: 20em;
  }
  select.catch-all {
    width: 20px;
    height: 100%;
  }
</style>
