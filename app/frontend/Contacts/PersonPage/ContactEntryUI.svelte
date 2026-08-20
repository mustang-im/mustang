{#if isEditing}
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
  <hbox class="value edit"
    bind:this={inputWrapperEl}
    tabindex="0" on:keydown={(event) => onKeyEnter(event, onEnter)}>
    <slot name="edit" />
  </hbox>
  <hbox class="actions edit">
    <Button
      onClick={remove}
      icon={DeleteIcon}
      iconOnly plain iconSize="14px"
      label={$t`Delete this information`} />
  </hbox>
{:else}
  <Clickable onClick={startEditing}>
    {#if protocolLabels}
      <hbox class="protocol display">
        {displayProtocol(entry.protocol)}
      </hbox>
    {:else}
      <hbox class="purpose display">
        {entry.purposeLabel}
      </hbox>
    {/if}
    <hbox class="value">
      <slot name="display" />
    </hbox>
  </Clickable>
  <hbox class="actions contact-entry">
    {#if !appGlobal.isMobile}
      {#if copied}
        <hbox class="copied">{$t`✓ Copied to clipboard`}</hbox>
      {/if}
      <slot name="actions display" />
      <Button
        onClick={() => { copyValue(); /* Do not `await` */ }}
        icon={CopyIcon}
        iconOnly plain iconSize="14px"
        label={$t`Copy info to clipboard`} />
    <!-- else mobile: Keep the <hbox>, so that the <grid> doesn't break -->
    {/if}
  </hbox>
{/if}

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import { ContactEntry } from "../../../logic/Abstract/Person";
  import { selectedContactEntry } from "../Person/Selected";
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";
  import Clickable from "../../Shared/Clickable.svelte";
  import CopyIcon from "lucide-svelte/icons/copy";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { onKeyEnter } from "../../Util/util";
  import { catchErrors } from "../../Util/error";
  import { sleep } from "../../../logic/util/util";
  import { createEventDispatcher, tick } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatch = createEventDispatcher();

  export let entry: ContactEntry;
  export let coll: Collection<ContactEntry>;
  export let isEditing = !entry.value;
  /** Same format as `ContactEntry.purposeLabels`.
   * Will show a Protocol dropdown instead of a Purpose dropdown. */
  export let protocolLabels: Record<string, string> = null;

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

  $: $selectedContactEntry == entry && catchErrors(focus)
  async function focus() {
    await tick();
    let inputE = inputWrapperEl.querySelector("input")
      ?? inputWrapperEl.querySelector("textarea");
    inputE?.focus();
    $selectedContactEntry = null; // Allow user to click elsewhere
  }

  async function copyValue() {
    await navigator.clipboard.writeText(entry.value);
    copied = true;
    await sleep(2);
    copied = false;
  }

  function remove() {
    coll.remove(entry);
    dispatch("save");
  }

  function displayProtocol(protocol: string) {
    return protocolLabels[protocol] ?? protocol ?? "";
  }
</script>

<style>
  .purpose,
  .protocol,
  .value {
    margin-block: 4px;
  }
  :global(.mobile) .purpose,
  :global(.mobile) .protocol,
  :global(.mobile) .value {
    margin-block: 8px;
  }

  .purpose,
  .protocol {
    margin-inline-end: 20px;
    color: grey;
    font-style: italic;
  }
  :global(.mobile) .purpose.edit,
  :global(.mobile) .protocol.edit,
  :global(.mobile) .actions.edit {
    padding-block-start: 5px;
  }


  .actions {
    align-items: center;
    justify-content: end;
    margin-inline-start: 16px;
    margin-inline-end: -8px; /* align with [+] above */
    gap: 8px;
  }
  .actions > :global(button) {
    min-width: 20px;
    height: 24px;
  }
  :global(.desktop) :global(.group:not(:hover)) .actions {
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
    border-bottom-width: 2px;
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
  }
  .value.edit :global(input:focus) {
    outline: none;
  }
</style>
