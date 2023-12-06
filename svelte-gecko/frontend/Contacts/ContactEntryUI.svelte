{#if isEditing}
  <hbox class="purpose edit">
    <select bind:value={entry.purpose}>
      {#each Object.entries(purposes) as p }
        <option value={p[0]}>{p[1]}</option>
      {/each}
    </select>
  </hbox>
  <hbox class="value edit">
    <slot name="edit" />
  </hbox>
  <hbox class="actions">
    <Button on:click={stopEditing} icon={OKIcon} iconOnly plain iconSize="14px" label="Finish editing and save" />
    <Button on:click={remove} icon={DeleteIcon} iconOnly plain iconSize="14px" label="Delete this information" />
  </hbox>
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <hbox class="purpose display" on:click={startEditing}>{displayPurpose(entry.purpose)}</hbox>
  <hbox class="value">
    <slot name="display" />
  </hbox>
  <hbox class="actions">
    <Button on:click={startEditing} icon={PencilIcon} iconOnly plain iconSize="12px" label="Edit" />
    <Button on:click={copyValue} icon={CopyIcon} iconOnly plain iconSize="12px" label="Copy info to clipboard" />
    {#if copied}
      <hbox>Copied to clipboard ✓</hbox>
    {/if}
    <slot name="actions" />
  </hbox>
{/if}

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ContactEntry } from "../../logic/Abstract/Person";
  import { sleep } from "../../logic/util/util";
  import Button from "../Shared/Button.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import CopyIcon from "lucide-svelte/icons/copy";
  import OKIcon from "lucide-svelte/icons/check";
  import DeleteIcon from "lucide-svelte/icons/trash-2";

  export let entry: ContactEntry;
  export let coll: Collection<ContactEntry>;

  let isEditing = false;
  let copied = false;

  function startEditing() {
    isEditing = true;
  }

  function stopEditing() {
    isEditing = false;
  }

  async function copyValue() {
    navigator.clipboard.writeText(entry.value);
    copied = true;
    await sleep(2);
    copied = false;
  }

  function remove() {
    stopEditing();
    coll.remove(entry);
  }

  const purposes = {
    "work": "Work",
    "home": "Home",
    "mobile": "Mobile",
    "whatsapp": "WhatsApp",
    "teams": "Teams",
    "matrix": "Matrix",
    "other": "Other",
  }

  function displayPurpose(purpose: string) {
    return purposes[purpose] || purpose;
  }
</script>

<style>
  .purpose, .value, .actions {
    margin-top: 8px;
    font-size: 13px;
  }

  .purpose {
    margin-right: 20px;
    color: grey;
    font-style: italic;
  }

  .value :global(a[href]) {
    color: darkblue;
  }

  .actions {
    margin-left: 12px;
  }
  .actions > :global(*) {
    min-width: 20px;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }

  .value.edit :global(input) {
    border: none;
    border-bottom: 2px solid #20AE9E;
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
  }
  .value.edit :global(input:focus) {
    outline: none;
  }
</style>
