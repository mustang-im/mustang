<button on:click on:dblclick
  title={label} class="button {classes}" class:filled
  style="borsder-radius: calc({iconSize}*2)"
  >
  <hbox class="icon">
    {#if icon}
      <Icon data={icon} size={iconSize} />
    {:else}
      <slot name="icon" />
    {/if}
  </hbox>
</button>

<script lang="ts">
  import Icon from 'svelte-icon/Icon.svelte';

  export let label: string = null;
  export let icon = null;
  export let classes = "";
  export let iconSize = "16px";
  export let filled = false;
</script>

<style>
  button {
    border: 1px solid #B2ADB8;
    border-radius: 1000px;
    padding: 8px;

    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .filled:not(:hover) {
    background-color: #160C27; /* 142862 */
    padding: 10px;
    border: none;
    color: white;
    stroke-width: 2px;
  }
  button:hover {
    background-color: rgba(32, 174, 158, 50%); /* #20AE9E */
  }
  .icon {
    margin-right: 0px;
  }
</style>
