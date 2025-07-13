{#if hasLeft && hasRight}
  <hbox class="splitter" bind:clientWidth={containerWidth}>
    <hbox class="left" bind:clientWidth={currentLeftWidth}>
      <slot name="left" />
    </hbox>
    <hbox class="splitter-bar"
      on:pointerdown={onMouseDown}
      style="width: {barWidth}px;"
      />
    <hbox class="right" style="flex: {rightRatio} 0 0;">
      <slot name="right" />
    </hbox>
  </hbox>
{:else if hasLeft}
  <slot name="left" />
{:else if hasRight}
  <slot name="right" />
{:else}
  <vbox class="splitter" />
{/if}

<svelte:window
  on:pointermove={onMouseMove}
  on:pointerup={onMouseUp}
  />

<script lang="ts">
  import { sanitize } from "../../../lib/util/sanitizeDatatypes";

  /** Left pane cannot be made smaller than this
   * in px */
  export let leftMinWidth = 30;
  /** Right pane cannot be made smaller than this
   * in px */
  export let rightMinWidth = 30;
  /** Initial size of right pane compared to left pane */
  export let initialRightRatio = 1;
  /** If false, will hide the left part and remove the splitter */
  export let hasLeft = true;
  /** If false, will hide the right part and remove the splitter */
  export let hasRight = true;
  /** If set, will save the ratio in localStorage as preference and restore it */
  export let name: string = null;

  const barWidth = 2;
  let rightRatio = JSON.parse(sanitize.nonemptystring(localStorage?.getItem("ui.splitter." + name), null)) ?? initialRightRatio;

  let isMouseDown = false;
  let previousMousePosX: number;
  let mouseMoveX: number;
  let containerWidth: number;
  let currentLeftWidth: number;
  let previousLeftWidth: number;

  function onMouseMove(event: PointerEvent) {
    if (!isMouseDown) {
      return;
    }
    let availableWidth = containerWidth - barWidth;
    mouseMoveX = previousMousePosX - event.clientX;
    let newLeftWidth = Math.max(
      Math.min(
        previousLeftWidth - mouseMoveX,
        availableWidth - rightMinWidth),
      leftMinWidth);
    let newRightWidth = availableWidth - newLeftWidth;
    let right = newRightWidth / availableWidth;
    let left = newLeftWidth / availableWidth;
    // const leftRatio = 1, so that we have to save only 1 value
    rightRatio = right / left;

    if (name) {
      localStorage.setItem("ui.splitter." + name, JSON.stringify(rightRatio));
    }
  }

  function onMouseDown(event: PointerEvent){
    previousLeftWidth = currentLeftWidth;
    previousMousePosX = event.clientX;
    isMouseDown = true;
  }

  function onMouseUp() {
    isMouseDown = false;
  }

  /** Copied to <SplitterHorizontal> */
</script>

<style>
  .splitter {
    height: 100%;
    flex: 1 0 0;
  }

  .splitter-bar {
    cursor: col-resize;
    z-index: 100;
    /*background: linear-gradient(
      to bottom,
      transparent 48%,
      var(--border) 48%,
      var(--border) 52%,
      transparent 52%
    );*/
  }
  .splitter-bar:hover {
    background-color: var(--hover-bg);
  }

  .left {
    flex: 1 0 0; /* by definition, see leftRatio above */
  }

  .left :global(> *:first-child),
  .right :global(> *:first-child) {
    flex: 1 0 0;
  }

  .left,
  .right {
    overflow: auto;
  }
</style>
