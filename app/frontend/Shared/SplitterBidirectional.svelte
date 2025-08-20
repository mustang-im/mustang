{#if horizontal}
  <SplitterHorizontal
    topMinWidth={firstMinPx}
    bottomMinWidth={secondMinPx}
    initialBottomRatio={initialSecondRatio}
    hasTop={hasFirst}
    hasBottom={hasSecond}
    {name}
    >
    <slot name="first" slot="top" />
    <slot name="second" slot="bottom" />
  </SplitterHorizontal>
{:else}
  <Splitter
    leftMinWidth={firstMinPx}
    rightMinWidth={secondMinPx}
    initialRightRatio={initialSecondRatio}
    hasLeft={hasFirst}
    hasRight={hasSecond}
    {name}
    >
    <slot name="first" slot="left" />
    <slot name="second" slot="right" />
  </Splitter>
  {/if}

<script lang="ts">
  import Splitter from "./Splitter.svelte";
  import SplitterHorizontal from "./SplitterHorizontal.svelte";

  export let horizontal = true;
  /** Left pane cannot be made smaller than this
   * in px */
  export let firstMinPx = 30;
  /** Right pane cannot be made smaller than this
   * in px */
  export let secondMinPx = 30;
  /** Initial size of right pane compared to left pane */
  export let initialSecondRatio = 1;
  /** If false, will hide the left part and remove the splitter */
  export let hasFirst = true;
  /** If false, will hide the right part and remove the splitter */
  export let hasSecond = true;
  /** If set, will save the ratio in localStorage as preference and restore it */
  export let name: string = null;
</script>
