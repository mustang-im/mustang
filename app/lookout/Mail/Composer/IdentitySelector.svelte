<button type="button" class="field-button" bind:this={buttonEl} tabindex={-1}
  aria-haspopup="menu" aria-expanded={isMenuOpen}
  on:click|stopPropagation={() => isMenuOpen = !isMenuOpen}>
  {$t`From`} <ChevronDownIcon size={14} />
</button>
<hbox class="from-text">
  {#if selectedIdentity?.isCatchAll}
    <span>{beforeCustom}</span>
    <input type="text" class="custom" bind:value={editableCustom} spellcheck="false"
      aria-label={$t`From`} size={Math.max(editableCustom?.length ?? 0, 6)}
      on:change={onCustomEdited} />
    <span>{afterCustom}</span>
  {:else}
    <span class="address">{fromAddress ?? ""}</span>
  {/if}
</hbox>
<Menu bind:isMenuOpen anchor={buttonEl} placement="bottom-start">
  {#each $identities.each as identity}
    <MenuItem label={identity.emailAddress}
      tooltip={identity.realname ? `${identity.realname} <${identity.emailAddress}>` : identity.emailAddress}
      selected={identity == selectedIdentity}
      onClick={() => selectedIdentity = identity} />
  {/each}
</Menu>

<script lang="ts">
  import { findAllIdentities, type MailIdentity } from "../../../logic/Mail/MailIdentity";
  import Menu from "../../Shared/Menu/Menu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let selectedIdentity: MailIdentity;
  export let fromAddress: string;
  export let fromName: string;
  export let identities: Collection<MailIdentity> = findAllIdentities();

  let buttonEl: HTMLButtonElement;
  let isMenuOpen = false;
  let beforeCustom = "";
  let afterCustom = "";
  let editableCustom = "";

  // <copied from="../../../frontend/Mail/Composer/IdentitySelector.svelte">
  $: $selectedIdentity && setIdentity($selectedIdentity)
  function setIdentity(identity: MailIdentity) {
    fromName = identity.realname;
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
  // </copied>
</script>

<style>
  .from-text {
    min-width: 0;
    min-height: 32px;
    border-block-end: 1px solid var(--lo-input-border);
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
  }
  .address {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .custom {
    min-width: 6ch;
    height: 24px;
    margin: 0 2px;
    padding: 0 4px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
</style>
