<hbox class="menuitem {classes}"
  title={tooltip}
  bind:this={menuItemE}
  >
  {#if label}
    <hbox class="label font-small">{label}</hbox>
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
    opacity: 50%;
  }
</style>
