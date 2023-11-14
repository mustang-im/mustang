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
  <hbox>
    <button on:click={stopEditing} class="simple">✓</button>
    <button on:click={remove} class="simple">x</button>
  </hbox>
{:else}
  <hbox class="purpose display">{displayPurpose(entry.purpose)}</hbox>
  <hbox class="value">
    <slot name="display" />
  </hbox>
  <hbox class="actions">
    <button on:click={copyValue} class="simple">©</button>
    <button on:click={startEditing} class="simple">✎</button>
    <slot name="actions" />
  </hbox>
{/if}

<script lang="ts">
  import type { ContactEntry } from "../../logic/Abstract/Person";

  export let entry: ContactEntry;

  let isEditing = false;

  function startEditing() {
    isEditing = true;
  }

  function stopEditing() {
    isEditing = false;
  }

  function copyValue() {
  }

  function remove() {
  }

  const purposes = {
    "work": "Work",
    "home": "Home",
    "mobile": "Mobile",
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
</style>
