<button on:click on:dblclick class="button {classes}" class:plain>
  <hbox class="icon">
    {#if icon}
      <Icon data={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
  {#if label}
    <hbox class="label">{label}</hbox>
  {:else}
    <slot name="label" />
  {/if}
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';

  export let label: string = null;
  export let icon = null;
  export let classes = "";
  export let plain = false;
  export let iconSize = "16px";
</script>

<style>
  button {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 6px 8px;

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button.plain {
    border: none;
    padding: 0 0;
  }
  button:hover {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
  .icon {
    margin-right: 8px;
  }
  button.plain .icon {
    margin-right: 0;
  }
</style>
