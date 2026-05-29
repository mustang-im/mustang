{#if isEditing}
  <input type="text" bind:value bind:this={inputEl}
    {placeholder}
    on:keydown={event => onKeyEnter(event, onEnter)}>
{:else}
  <Clickable onDoubleClick={startEditing}>
    <div class="value">
      {value}
    </div>
  </Clickable>
{/if}

<script lang="ts">
  import Clickable from "../../Shared/Clickable.svelte";
  import { onKeyEnter } from "../../Util/util";
  import { createEventDispatcher, tick } from 'svelte';
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
    border-bottom-width: 2px;
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
    margin-block-start: 9px;
  }
  input:focus {
    outline: none;
  }
</style>
