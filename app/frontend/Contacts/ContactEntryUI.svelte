{#if isEditing}
  <hbox class="purpose edit font-small">
    <select bind:value={entry.purpose}>
      {#each Object.entries(purposes) as p }
        <option value={p[0]}>{p[1]}</option>
      {/each}
    </select>
  </hbox>
  <hbox class="value edit font-small"
    bind:this={inputWrapperEl}
    tabindex="0" on:keydown={(event) => onKeyEnter(event, onEnter)}>
    <slot name="edit" />
  </hbox>
  <hbox class="actions font-small">
    <Button
      on:click={stopEditing}
      icon={OKIcon}
      iconOnly plain iconSize="14px"
      label={$t`Finish editing and save`} />
    <Button
      on:click={remove}
      icon={DeleteIcon}
      iconOnly plain iconSize="14px"
      label={$t`Delete this information`} />
  </hbox>
{:else}
  <hbox class="purpose display font-small" on:click={startEditing}>
    {displayPurpose(entry.purpose)}
  </hbox>
  <hbox class="value font-small" on:click={startEditing}>
    <slot name="display" />
  </hbox>
  <hbox class="actions contact-entry font-small">
    {#if copied}
      <hbox class="copied">{$t`✓ Copied to clipboard`}</hbox>
    {/if}
    <slot name="actions" />
    <Button
      on:click={copyValue}
      icon={CopyIcon}
      iconOnly plain iconSize="14px"
      label={$t`Copy info to clipboard`} />
    <Button
      on:click={startEditing}
      icon={PencilIcon}
      iconOnly plain iconSize="14px"
      label={$t`Edit`} />
  </hbox>
{/if}

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ContactEntry } from "../../logic/Abstract/Person";
  import { selectedContactEntry } from "./Person/Selected";
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
  export let isEditing = !entry.value;

  let inputWrapperEl: HTMLDivElement;
  let copied = false;

  async function startEditing() {
    isEditing = true;
    $selectedContactEntry == entry;
  }

  function stopEditing() {
    isEditing = false;
    dispatch("save");
  }

  function onEnter() {
    stopEditing();
  }

  $: $selectedContactEntry == entry && focus()
  async function focus() {
    await tick();
    let inputE = inputWrapperEl.querySelector("input")
      ?? inputWrapperEl.querySelector("textarea");
    inputE?.focus();
  }

  async function copyValue() {
    navigator.clipboard.writeText(entry.value);
    copied = true;
    await sleep(2);
    copied = false;
  }

  function remove() {
    coll.remove(entry);
    dispatch("save");
  }

  const purposes = {
    "work": $t`Work *=> Business address or phone number`,
    "home": $t`Home *=> Private address or phone number`,
    "mobile": $t`Mobile *=> Cell phone number`,
    "other": $t`Other *=> Email address or phone number that is not home or work`,
  }

  function displayPurpose(purpose: string) {
    return purposes[purpose] || purpose;
  }
</script>

<style>
  .purpose, .value {
    margin-block: 4px;
  }

  .purpose {
    margin-inline-end: 20px;
    color: grey;
    font-style: italic;
  }

  .actions {
    align-items: center;
    justify-content: end;
    margin-inline-start: 16px;
    height: 100%;
  }
  .actions > :global(button) {
    min-width: 20px;
    height: 100%;
    margin-right: 8px;
  }
  :global(.group:not(:hover)) .actions {
    visibility: hidden;
  }
  .actions :global(button) {
    color: #9894A0;
  }
  .copied {
    margin-inline-end: 8px;
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
