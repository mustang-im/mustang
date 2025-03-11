{#if isEditing}
  <hbox class="purpose edit">
    <select bind:value={entry.purpose}>
      {#each Object.entries(purposes) as p }
        <option value={p[0]}>{p[1]}</option>
      {/each}
    </select>
  </hbox>
  <hbox class="value edit"
    bind:this={inputWrapperEl}
    tabindex="0" on:keydown={(event) => onKeyEnter(event, onEnter)}>
    <slot name="edit" />
  </hbox>
  <hbox class="actions">
    <Button on:click={stopEditing} icon={OKIcon} iconOnly plain iconSize="14px" label={$t`Finish editing and save`} />
    <Button on:click={remove} icon={DeleteIcon} iconOnly plain iconSize="14px" label={$t`Delete this information`} />
  </hbox>
{:else}
  <hbox class="purpose display" on:click={startEditing}>{displayPurpose(entry.purpose)}</hbox>
  <hbox class="value" on:click={startEditing}>
    <slot name="display" />
  </hbox>
  <hbox class="actions contact-entry">
    <Button on:click={startEditing} icon={PencilIcon} iconOnly plain iconSize="12px" label={$t`Edit`} />
    <Button on:click={copyValue} icon={CopyIcon} iconOnly plain iconSize="12px" label={$t`Copy info to clipboard`} />
    {#if copied}
      <hbox>{$t`Copied to clipboard ✓`}</hbox>
    {/if}
    <slot name="actions" />
  </hbox>
{/if}

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ContactEntry } from "../../logic/Abstract/Person";
  import Button from "../Shared/Button.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import CopyIcon from "lucide-svelte/icons/copy";
  import OKIcon from "lucide-svelte/icons/check";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { onKeyEnter } from "../Util/util";
  import { sleep } from "../../logic/util/util";
  import { createEventDispatcher, tick } from 'svelte';
  import { t } from "../../l10n/l10n";
  const dispatch = createEventDispatcher();

  export let entry: ContactEntry;
  export let coll: Collection<ContactEntry>;

  let isEditing = !entry.value;
  let inputWrapperEl: HTMLDivElement;
  let copied = false;

  async function startEditing() {
    isEditing = true;
    await tick();
    inputWrapperEl.querySelector("input")?.focus();
  }

  function stopEditing() {
    isEditing = false;
    dispatch("save");
  }

  function onEnter() {
    stopEditing();
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
    "work": $t`Work`,
    "home": $t`Home`,
    "mobile": $t`Mobile`,
    "whatsapp": "WhatsApp",
    "teams": "Microsoft Teams",
    "matrix": "Matrix",
    "other": $t`Other`,
  }

  function displayPurpose(purpose: string) {
    return purposes[purpose] || purpose;
  }
</script>

<style>
  .purpose, .value, .actions {
    margin-block-start: 8px;
    font-size: 13px;
  }

  .purpose {
    margin-inline-end: 20px;
    color: grey;
    font-style: italic;
  }

  .actions {
    margin-inline-start: 12px;
  }
  .actions > :global(*) {
    min-width: 20px;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }

  .value {
    min-height: 1.2em;
  }
  .value.edit :global(input) {
    border: none;
    border-bottom: 2px solid var(--input-focus);
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
  }
  .value.edit :global(input:focus) {
    outline: none;
  }
</style>
