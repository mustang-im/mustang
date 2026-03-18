<hbox class="app-bar" flex>
  <slot />
</hbox>

<script lang="ts">
</script>

<style>
  .app-bar {
    height: 48px;
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
    box-shadow: 1px 0px 3px 0px rgba(22, 12, 39, 20%); /* #160C27 */
    z-index: 4;
    justify-content: center;
  }
  .app-bar > :global(*) {
    flex: 1 0 0;
    justify-content: center;
  }
  .app-bar > :global(button),
  .app-bar > * > :global(button) {
    width: 48px;
    margin-inline-start: 2px;
  }
  .app-bar :global(> button svg),
  .app-bar :global(> * > button svg),
  .app-bar :global(.menu-button svg) {
    stroke-width: 1.3px;
    stroke: var(--appbar-fg);
  }
  .app-bar :global(.empty) {
    width: 48px;
  }
  /** TODO Decide based on available space */
  .app-bar :global(.extra) {
    display: none;
  }
</style>
