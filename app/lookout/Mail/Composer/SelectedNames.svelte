<hbox class="selected-names">
  {#each $picks.each as recipient (recipient)}
    <hbox class="name" title={recipient.emailAddress}>
      <span>{recipient.name || recipient.emailAddress}</span>
      <button class="remove" title={$t`Remove`} aria-label={$t`Remove`} on:click={() => onRemove(recipient)}>
        <RemoveIcon size={12} />
      </button>
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
    gap: 4px;
    min-height: 32px;
    max-height: 64px;
    overflow-y: auto;
    padding: 2px 4px;
    border-block-end: 1px solid var(--lo-input-border);
  }
  .name {
    align-items: center;
    gap: 2px;
    padding: 1px 2px 1px 8px;
    border-radius: 12px;
    background-color: var(--lo-accent-tint);
    color: var(--lo-fg);
    font-size: var(--lo-font-size-small);
  }
  .remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--lo-fg-secondary);
  }
  .remove:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
</style>
