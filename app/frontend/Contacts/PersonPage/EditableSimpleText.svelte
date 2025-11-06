{#if isEditing}
  <input type="text" bind:value bind:this={inputEl}
    {placeholder}
    on:keydown={event => onKeyEnter(event, onEnter)}>
  <hbox class="actions">
    <Button
      on:click={stopEditing}
      icon={OKIcon}
      iconOnly plain iconSize="14px"
      classes="save"
      label={$t`Finish editing and save`} />
  </hbox>
{:else}
  <div class="value" on:dblclick={startEditing}>
    {value}
  </div>
  <hbox class="actions value">
    <Button
      on:click={startEditing}
      icon={PencilIcon}
      iconOnly plain iconSize="12px"
      classes="edit"
      label={$t`Edit`} />
  </hbox>
{/if}

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import OKIcon from "lucide-svelte/icons/check";
  import { onKeyEnter } from "../../Util/util";
  import { createEventDispatcher, tick } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatch = createEventDispatcher();

  /** in/out */
  export let value: string;
  /** in */
  export let placeholder = "";
  /** out only */
  export let isEditing = false;
  export let isName = false;

  let inputEl: HTMLInputElement;

  $: !value && isName && startEditing();

  async function startEditing() {
    isEditing = true;
    await tick();
    inputEl.focus();
    inputEl.select();
  }

  function stopEditing() {
    isEditing = false;
    dispatch("save");
  }

  function onEnter() {
    stopEditing();
  }
</script>

<style>
  .value, input, .actions {
    margin-block-start: 8px;
  }

  .actions {
    margin-inline-start: 12px;
  }
  .actions > :global(*) {
    min-width: 20px;
  }
  :global(*:not(:hover)) .actions.value {
    visibility: hidden;
  }

  input {
    border: none;
    border-bottom: 2px solid var(--input-focus);
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
    margin-block-start: 9px;
  }
  input:focus {
    outline: none;
  }
</style>
