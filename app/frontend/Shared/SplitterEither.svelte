{#if horizontal}
	<SplitterHorizontal {name} topMinWidth={firstMinPx} bottomMinWidth={secondMinPx} initialBottomRatio={initialSecondRatio}>
		<slot name="first" slot="top" />
		<slot name="second" slot="bottom" />
	</SplitterHorizontal>
{:else}
	<Splitter {name} leftMinWidth={firstMinPx} rightMinWidth={secondMinPx} initialRightRatio={initialSecondRatio}>
		<slot name="first" slot="left" />
		<slot name="second" slot="right" />
	</Splitter>
{/if}

<script lang="ts">
  import Splitter from "./Splitter.svelte";
  import SplitterHorizontal from "./SplitterHorizontal.svelte";

	export let horizontal = false;
	/** Left pane cannot be made smaller than this
	 * in px */
  export let firstMinPx = 30;
	/** Right pane cannot be made smaller than this
	 * in px */
	export let secondMinPx = 30;
	/** Initial size of right pane compared to left pane */
  export let initialSecondRatio = 1;
	/** If set, will save the ratio in localStorage as preference and restore it */
	export let name: string = null;
</script>
