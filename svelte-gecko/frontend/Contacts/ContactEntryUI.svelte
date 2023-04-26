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
  </hbox>
{:else}
  <hbox class="purpose display">{displayPurpose(entry.purpose)}</hbox>
  <slot name="display" />
  <hbox class="actions">
    <slot name="actions" />
    <button on:click={startEditing} class="simple">✎</button>
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
  .purpose {
    margin-right: 20px;
  }

  .actions {
    margin-left: 12px;
  }

  button {
    margin-left: 5px;
  }
</style>
