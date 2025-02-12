{#if icon}
  <hbox class="outer" flex>
    <hbox class="icon" title={label}>
      <svelte:component this={icon} size="20px" />
    </hbox>
    <vbox class="section" title={label} flex>
      <slot />
    </vbox>
  </hbox>
{:else}
  <vbox class="section outer" title={label} flex>
    <slot />
  </vbox>
{/if}

<script lang="ts">
  import type { ComponentType } from "svelte";

  export let label: string = "";
  export let icon: ComponentType = null;
</script>

<style>
  .outer {
    margin-block-start: 12px;
    margin-block-end: 12px;
  }
  .icon {
    width: 36px;
    align-items: start;
  }
</style>
