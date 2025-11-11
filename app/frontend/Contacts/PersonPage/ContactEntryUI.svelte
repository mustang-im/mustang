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
        {#each Object.entries(suggestedPurposes) as p }
          <option value={p[0]}>{p[1]}</option>
        {/each}
        {#if !entry.purpose || !suggestedPurposes[entry.purpose]}
          <option value={entry.purpose}>{hiddenPurposes[entry.purpose] ?? entry.purpose}</option>
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
    {#if !appGlobal.isMobile}
      <Button
        on:click={stopEditing}
        icon={OKIcon}
        iconOnly plain iconSize="14px"
        label={$t`Finish editing and save`} />
    {/if}
    <Button
      on:click={remove}
      icon={DeleteIcon}
      iconOnly plain iconSize="14px"
      label={$t`Delete this information`} />
  </hbox>
{:else}
  {#if protocolLabels}
    <hbox class="protocol display" on:click={startEditing}>
      {displayProtocol(entry.protocol)}
    </hbox>
  {:else}
    <hbox class="purpose display" on:click={startEditing}>
      {displayPurpose(entry.purpose)}
    </hbox>
  {/if}
  <hbox class="value" on:click={startEditing}>
    <slot name="display" />
  </hbox>
  <hbox class="actions contact-entry">
    {#if !appGlobal.isMobile}
      {#if copied}
        <hbox class="copied">{$t`✓ Copied to clipboard`}</hbox>
      {/if}
      <slot name="actions display" />
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
    <!-- else mobile: Keep the <hbox>, so that the <grid> doesn't break -->
    {/if}
  </hbox>
{/if}

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ContactEntry } from "../../../logic/Abstract/Person";
  import { selectedContactEntry } from "../Person/Selected";
  import { appGlobal } from "../../../logic/app";
  import Button from "../../Shared/Button.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import CopyIcon from "lucide-svelte/icons/copy";
  import OKIcon from "lucide-svelte/icons/check";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { onKeyEnter } from "../../Util/util";
  import { sleep } from "../../../logic/util/util";
  import { createEventDispatcher, tick } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatch = createEventDispatcher();

  export let entry: ContactEntry;
  export let coll: Collection<ContactEntry>;
  export let isEditing = !entry.value;
  /** Same format as `suggestedPurposes`.
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

  /** Contains the Purpose values that we want to show to the user for him to select from */
  const suggestedPurposes = {
    "work": $t`Work *=> Business address or phone number`,
    "home": $t`Home *=> Private address or phone number`,
    "mobile": $t`Mobile *=> Cell phone number`,
    "other": $t`Other *=> Email address or phone number that is not home or work`,
  }

  /** Contains the Purpose values that the application might set, but we don't want the user to select these. */
  const hiddenPurposes = {
    "primary": $t`Primary *=> Most important email address for that person`,
    "collected": $t`Collected *=> Email address that was automatically added to the contacts`,
    null: $t`Select *=> Select what this email address is for`,
  }

  function displayPurpose(purpose: string) {
    return suggestedPurposes[purpose] ?? hiddenPurposes[purpose] ?? purpose ?? "";
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
  }
  .actions > :global(button) {
    min-width: 20px;
    height: 24px;
    margin-right: 8px;
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
