{#if icon}
  <hbox class="section outer" {flex}>
    <hbox class="icon" title={label} >
      <svelte:component this={icon} size="20px" />
    </hbox>
    <vbox class="inner" title={label} flex>
      <slot />
    </vbox>
  </hbox>
{:else}
  <vbox class="section outer" title={label} {flex}>
    <slot />
  </vbox>
{/if}

<script lang="ts">
  import type { ConstructorOfATypedSvelteComponent } from "svelte";

  export let label: string = "";
  export let icon: ConstructorOfATypedSvelteComponent = null;
  export let flex = null;
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
