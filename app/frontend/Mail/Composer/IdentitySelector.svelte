<hbox class="identity-selector">
  {#if selectedIdentity.isCatchAll}
    <label for="customFrom">{$t`From`}</label>
    {beforeCustom}
    <input type="email" bind:value={editableCustom}
      name="customFrom" spellcheck="false"
      on:change={() => catchErrors(onCustomEdited)}
      size={editableCustom?.length}
      />
    {afterCustom}
    <hbox class="account">
      {selectedIdentity.account?.name}
    </hbox>
  {/if}
  <select bind:value={selectedIdentity} class:catch-all={selectedIdentity.isCatchAll}>
    {#each $identities.each as identity }
      <option value={identity}>
        {identity.isCatchAll && identity.isEMailAddress(customFromAddress) && identity.emailAddress != customFromAddress
          ? customFromAddress
          : identity.name}
        -
        {identity.account?.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { appGlobal } from "../../../logic/app";
  import { catchErrors } from "../../Util/error";
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

  let beforeCustom: string;
  let afterCustom: string;
  let editableCustom: string;

  $: $selectedIdentity?.isCatchAll && setCatchAll($selectedIdentity)
  function setCatchAll(identity: MailIdentity) {
    if (!identity?.isCatchAll) {
      return;
    }
    if (!identity.isEMailAddress(customFromAddress)) {
      customFromAddress = identity.emailAddress;
    }

    let parts = identity.emailAddress.split("*");
    beforeCustom = parts[0];
    afterCustom = parts[1];
    editableCustom = customFromAddress.substring(beforeCustom.length, customFromAddress.length - afterCustom.length);
  }

  function onCustomEdited() {
    customFromAddress = beforeCustom + editableCustom + afterCustom;
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
  select.catch-all {
    width: 20px;
    height: 100%;
  }
  .account {
    margin-inline-start: 16px;
    font-style: italic;
    opacity: 75%;
  }
</style>
