<!-- <copied from="../../frontend/Contacts/PersonPage/ContactEntryUI.svelte"> -->
{#if protocolLabels}
  <hbox class="protocol edit">
    <select bind:value={entry.protocol}>
      {#each Object.entries(protocolLabels) as p }
        <option value={p[0]}>{p[1]}</option>
      {/each}
      {#if !entry.protocol}
        <option value={entry.protocol}>{$t`Select *=> Select what this chat address is for`}</option>
      {:else if !protocolLabels[entry.protocol]}
        <option value={entry.protocol}>{entry.protocol}</option>
      {/if}
    </select>
  </hbox>
{:else}
  <hbox class="purpose edit">
    <select bind:value={entry.purpose}>
      {#each Object.entries(ContactEntry.purposeLabels) as p }
        <option value={p[0]}>{p[1]}</option>
      {/each}
      {#if !entry.purpose || !ContactEntry.purposeLabels[entry.purpose]}
        <option value={entry.purpose}>{ContactEntry.hiddenPurposeLabels[entry.purpose] ?? entry.purpose}</option>
      {/if}
    </select>
  </hbox>
{/if}
<!-- </copied> -->
<hbox class="value">
  <slot />
</hbox>
<hbox class="remove">
  <button on:click={() => coll.remove(entry)} title={$t`Delete this information`}>
    <RemoveIcon size={14} />
  </button>
</hbox>

<script lang="ts">
  import { ContactEntry } from "../../logic/Abstract/Person";
  import RemoveIcon from "lucide-svelte/icons/x";
  import type { Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let entry: ContactEntry;
  export let coll: Collection<ContactEntry>;
  export let protocolLabels: Record<string, string> = null;
</script>

<style>
  .purpose,
  .protocol,
  .value,
  .remove {
    align-items: start;
    min-width: 0;
  }
  .value {
    flex-direction: column;
    align-items: stretch;
  }
  .value :global(input) {
    width: 100%;
    box-sizing: border-box;
  }
  .value :global(input + input) {
    margin-block-start: 4px;
  }
  .remove button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .remove button:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-danger);
  }
</style>
