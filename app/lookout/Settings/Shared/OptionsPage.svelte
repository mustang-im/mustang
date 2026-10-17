<vbox class="options-page">
  <hbox class="page-header">
    <hbox class="page-icon"><svelte:component this={icon} size={32} strokeWidth={1.25} /></hbox>
    <hbox class="description">{description}</hbox>
  </hbox>
  <slot />
</vbox>

<script lang="ts">
  export let icon: ConstructorOfATypedSvelteComponent;
  export let description: string;
</script>

<style>
  .options-page {
    padding: 4px 16px 16px 4px;
  }
  .page-header {
    align-items: center;
    gap: 12px;
    margin-block-end: 12px;
  }
  .page-icon {
    color: var(--lo-accent-text);
  }
  .description {
    font-size: 15px;
  }
</style>
