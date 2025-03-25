<hbox class="menuitem {classes}"
  title={tooltip}
  bind:this={menuItemE}
  >
  {#if label}
    <hbox class="label">{label}</hbox>
  {:else}
    <slot />
  {/if}
</hbox>

<script lang="ts">
  export let label: string = null;
  export let tooltip: string = "";
  export let classes = "";

  let menuItemE: HTMLDivElement;
</script>

<style>
  .menuitem {
    align-items: center;
    padding: 7px 14px;
  }
  .label {
    white-space: nowrap;
    font-size: 14px;
    opacity: 50%;
  }
</style>
