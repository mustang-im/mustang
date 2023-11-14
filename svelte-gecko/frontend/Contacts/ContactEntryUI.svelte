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
    <button on:click={stopEditing} class="simple">✓</button>
    <button on:click={remove} class="simple">x</button>
  </hbox>
{:else}
  <hbox class="purpose display">{displayPurpose(entry.purpose)}</hbox>
  <hbox class="value">
    <slot name="display" />
  </hbox>
  <hbox class="actions">
    <button on:click={startEditing} class="simple">✎</button>
    {#if copied}
      <hbox>Copied to clipboard</hbox>
    {:else}
      <button on:click={copyValue} class="simple">©</button>
    {/if}
    <slot name="actions" />
  </hbox>
{/if}

<script lang="ts">
  import type { ContactEntry } from "../../logic/Abstract/Person";
  import { sleep } from "../../logic/util/util";

  export let entry: ContactEntry;

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
  }

  const purposes = {
    "work": "Work",
    "home": "Home",
    "mobile": "Mobile",
    "WhatsApp": "WhatsApp",
    "Teams": "Teams",
    "Matrix": "Matrix",
    "other": "Other",
  }

  function displayPurpose(purpose: string) {
    return purposes[purpose] || purpose;
  }
</script>

<style>
  .purpose, .value, .actions {
    margin-top: 12px;
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

  button {
    margin-left: 5px;
  }

  .value.edit :global(input) { /* TODO does not apply */
    border: none;
    border-bottom: 2px solid #20AE9E;
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
  }
</style>
