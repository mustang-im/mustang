<hbox class="selected-names" role="list">
  {#each $picks.each as recipient, index (recipient)}
    <hbox class="name" role="listitem" title={recipient.emailAddress}>
      <span class="resolved">{recipient.name || recipient.emailAddress}</span>
      <button type="button" class="remove" title={$t`Remove`} aria-label={$t`Remove`} on:click={() => onRemove(recipient)}>
        <RemoveIcon size={12} />
      </button>
      {#if index < $picks.length - 1}
        <span class="separator">;</span>
      {/if}
    </hbox>
  {/each}
</hbox>

<script lang="ts">
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import RemoveIcon from "lucide-svelte/icons/x";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let picks: ArrayColl<PersonUID>;
  export let onRemove: (recipient: PersonUID) => void;
</script>

<style>
  .selected-names {
    flex-wrap: wrap;
    align-items: center;
    column-gap: 4px;
    min-height: 30px;
    max-height: 64px;
    overflow-y: auto;
    padding: 2px 6px;
    box-sizing: border-box;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .name {
    align-items: center;
  }
  .resolved {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--lo-fg-secondary);
    opacity: 0;
  }
  .name:hover .remove,
  .remove:focus-visible {
    opacity: 1;
  }
  .remove:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
</style>
