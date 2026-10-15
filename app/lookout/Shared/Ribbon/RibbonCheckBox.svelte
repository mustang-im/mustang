<div class="ribbon-item fixed-width ribbon-checkbox look-{look}" data-size="small">
  <CheckBox {label} bind:checked {disabled} {tooltip} {onChange} />
</div>

<script lang="ts">
  import CheckBox from "../Form/CheckBox.svelte";
  import { RibbonGroupModel, type RibbonItemLook } from "./Ribbon";
  import { getContext } from "svelte";

  export let label: string;
  export let checked = false;
  export let onChange: (checked: boolean) => void | Promise<void> = null;
  export let disabled: boolean | string = false;
  export let tooltip: string = null;

  const group = getContext<RibbonGroupModel>(RibbonGroupModel.contextKey) ?? new RibbonGroupModel("");
  const layout = group.layout;
  const stage = group.stage;
  const collapsed = group.collapsed;
  let look: RibbonItemLook;
  $: look = RibbonGroupModel.itemLook($layout, $stage, $collapsed, "small");
</script>

<style>
  .ribbon-checkbox {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: max-content;
    height: var(--lo-ribbon-row-height);
    padding: 0 6px;
    border-radius: var(--lo-radius-small);
    font-size: var(--lo-font-size-small);
    white-space: nowrap;
  }
  .ribbon-checkbox:hover {
    background-color: var(--lo-hover-bg);
  }
  .ribbon-checkbox :global(.lo-checkbox) {
    gap: 6px;
    min-height: 0;
  }
  .look-simplified,
  .look-simplified-icon,
  .look-list {
    height: var(--lo-ribbon-button-height);
    padding: 0 8px;
    font-size: 13px;
  }
</style>
