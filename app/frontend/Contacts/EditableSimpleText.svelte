{#if isEditing}
  <input type="text" bind:value
    {placeholder}
    on:keydown={event => onKeyEnter(event, onEnter)}>
  <hbox class="actions">
    <Button on:click={stopEditing} icon={OKIcon} iconOnly plain iconSize="14px" label="Finish editing and save" />
  </hbox>
{:else}
  <div class="value">
    {value}
  </div>
  <hbox class="actions">
    <Button on:click={startEditing} icon={PencilIcon} iconOnly plain iconSize="12px" label="Edit" />
  </hbox>
{/if}

<script lang="ts">
  import Button from "../Shared/Button.svelte";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import OKIcon from "lucide-svelte/icons/check";
  import { onKeyEnter } from "../Util/util";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  /** in/out */
  export let value: string;
  /** in */
  export let placeholder = "";
  /** out only */
  export let isEditing = false;

  function startEditing() {
    isEditing = true;
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
    margin-top: 8px;
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

  input {
    border: none;
    border-bottom: 2px solid #20AE9E;
    /* background-color: rgba(32, 174, 158, 20%); /* #20AE9E */
    margin-top: 9px;
  }
  input:focus {
    outline: none;
  }
</style>
