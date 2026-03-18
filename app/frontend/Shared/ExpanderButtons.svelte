<hbox class="expander-buttons">
  <slot />
</hbox>

<style>
  .expander-buttons {
    flex-wrap: wrap;
    gap: 2px;
  }
  :global(.mobile) .expander-buttons {
    gap: 4px;
  }
</style>
