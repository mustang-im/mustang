<vbox
  class="splitter"
  bind:clientHeight={containerHeight}
  >
	<hbox class="top"
		bind:clientHeight={currentTopHeight}
		>
		<slot name="top" />
  </hbox>
	<hbox
    class="splitter-bar"
    on:pointerdown={onMouseDown}
    style="height: {barHeight}px;"
  	/>
	<hbox class="bottom"
	  style="flex: {bottomRatio} 0 0;"
		>
		<slot name="bottom" />
  </hbox>
</vbox>
<svelte:window
	on:pointermove={onMouseMove}
	on:pointerup={onMouseUp}
  />

<script lang="ts">
  import { sanitize } from "../../../lib/util/sanitizeDatatypes";

	/** Copy of <Splitter> */

	/** Left pane cannot be made smaller than this
	 * in px */
  export let topMinWidth = 30;
	/** Right pane cannot be made smaller than this
	 * in px */
	export let bottomMinWidth = 30;
	/** Initial size of right pane compared to left pane */
  export let initialBottomRatio = 1;
	/** If set, will save the ratio in localStorage as preference and restore it */
	export let name: string = null;

  const barHeight = 2;
	let bottomRatio = JSON.parse(sanitize.nonemptystring(localStorage?.getItem("ui.splitter." + name), null)) ?? initialBottomRatio;

	let isMouseDown = false;
  let previousMousePosY: number;
	let mouseMoveY: number;
	let containerHeight: number;
	let currentTopHeight: number;
	let previousTopHeight: number;

	function onMouseMove(event: PointerEvent) {
		if (!isMouseDown) {
      return;
    }
		let availableHeight = containerHeight - barHeight;
    mouseMoveY = previousMousePosY - event.clientY;
    let newLeftWidth = Math.max(
			Math.min(
				previousTopHeight - mouseMoveY,
				availableHeight - bottomMinWidth),
			topMinWidth);
		let newBottomWidth = availableHeight - newLeftWidth;
		let bottom = newBottomWidth / availableHeight;
		let top = newLeftWidth / availableHeight;
		// const topRatio = 1, so that we have to save only 1 value
		bottomRatio = bottom / top;

		if (name) {
		  localStorage.setItem("ui.splitter." + name, JSON.stringify(bottomRatio));
		}
	}

	function onMouseDown(event: PointerEvent){
		previousTopHeight = currentTopHeight;
		previousMousePosY = event.clientY;
		isMouseDown = true;
	}

	function onMouseUp() {
		isMouseDown = false;
	}
</script>

<style>
	.splitter {
		height: 100%;
	}

	.splitter-bar {
		cursor: row-resize;
		z-index: 100;
	}

	.top {
		flex: 1 0 0; /* by definition, see topRatio above */
	}

	.top :global(> *:first-child),
	.bottom :global(> *:first-child) {
		flex: 1 0 0;
	}
</style>
