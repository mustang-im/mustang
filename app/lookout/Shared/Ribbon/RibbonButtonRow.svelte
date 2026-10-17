<div class="ribbon-item fixed-width ribbon-button-row look-{look}" data-size="small" role="group" aria-label={label}>
  <slot />
</div>

<script lang="ts">
  import { RibbonGroupModel, type RibbonItemLook } from "./RibbonGroup";
  import { getContext, setContext } from "svelte";

  export let label: string;

  setContext(RibbonGroupModel.buttonRowKey, true);
  const group = getContext<RibbonGroupModel>(RibbonGroupModel.contextKey) ?? new RibbonGroupModel("");
  const layout = group.layout;
  const collapsed = group.collapsed;
  let look: RibbonItemLook;
  $: look = RibbonGroupModel.buttonRowLook($layout, $collapsed);
</script>

<style>
  .ribbon-button-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: max-content;
  }
  .ribbon-button-row.look-small-icon :global(.ribbon-button) {
    width: var(--lo-ribbon-row-button-width);
  }
  .ribbon-button-row.look-list {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
</style>
