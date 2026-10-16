<hbox flex class="reading-pane-layout">
  {#if position == ReadingPanePosition.Right}
    <Splitter name="{name}.right" initialRightRatio={readingRatio} leftMinWidth={300} rightMinWidth={320}>
      <hbox flex class="part list" slot="left"><slot name="list" /></hbox>
      <hbox flex class="part reading right" slot="right"><slot name="reading" /></hbox>
    </Splitter>
  {:else if position == ReadingPanePosition.Bottom}
    <SplitterHorizontal name="{name}.bottom" initialBottomRatio={1.4} topMinWidth={160} bottomMinWidth={200}>
      <hbox flex class="part list top" slot="top"><slot name="list" /></hbox>
      <hbox flex class="part reading bottom" slot="bottom"><slot name="reading" /></hbox>
    </SplitterHorizontal>
  {:else}
    <hbox flex class="part list single"><slot name="list" /></hbox>
  {/if}
</hbox>

<script lang="ts">
  import { ReadingPanePosition } from "./MailView";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import SplitterHorizontal from "../../frontend/Shared/SplitterHorizontal.svelte";

  export let position: ReadingPanePosition;
  export let name = "lookout.mail.readingPane";
  export let readingRatio = 1.6;
</script>

<style>
  .reading-pane-layout {
    min-width: 0;
    min-height: 0;
  }
  .reading-pane-layout > :global(.splitter) {
    flex: 1 0 0;
    min-width: 0;
  }
  .part {
    min-width: 0;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
  }
  .list {
    padding: 0 4px 8px 0;
  }
  .list.single {
    padding-inline-end: 8px;
  }
  .list.top {
    padding: 0 8px 4px 0;
  }
  .reading.right {
    padding: 0 8px 8px 4px;
  }
  .reading.bottom {
    padding: 4px 8px 8px 0;
  }
  .part :global(> *) {
    flex: 1 0 0;
  }
</style>
