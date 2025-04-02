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
  {#if $identities.length > 1}
    <select bind:value={selectedIdentity} class:catch-all={selectedIdentity.isCatchAll}>
      {#each $identities.each as identity }
        <option value={identity}>
          {identity.isCatchAll && identity.isEMailAddress(fromAddress) && identity.emailAddress != fromAddress
            ? fromAddress
            : identity.name}
          -
          {identity.account?.name}
        </option>
      {/each}
    </select>
  {/if}
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
  export let fromAddress: string;
  export let fromName: string;

  let beforeCustom: string;
  let afterCustom: string;
  let editableCustom: string;

  $: $selectedIdentity && setIdentity($selectedIdentity)
  function setIdentity(identity: MailIdentity) {
    fromName = identity.userRealname;
    if (!identity?.isCatchAll) {
      fromAddress = identity.emailAddress;
      return;
    }
    if (!identity.isEMailAddress(fromAddress)) {
      fromAddress = identity.emailAddress;
    }

    let parts = identity.emailAddress.split("*");
    beforeCustom = parts[0];
    afterCustom = parts[1];
    editableCustom = fromAddress.substring(beforeCustom.length, fromAddress.length - afterCustom.length);
  }

  function onCustomEdited() {
    fromAddress = beforeCustom + editableCustom + afterCustom;
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
