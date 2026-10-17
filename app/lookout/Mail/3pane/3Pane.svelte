<hbox flex class="panes">
  {#if $folderPane.value == FolderPaneMode.Minimized}
    <FolderPaneMinimized name={$selectedFolder ? FolderTreeActions.displayName($selectedFolder) : ""}
      onExpand={() => { folderPane.value = FolderPaneMode.Normal; }} />
  {/if}
  <Splitter name="lookout.mail.folderPane" initialRightRatio={5} leftMinWidth={180} rightMinWidth={480}
    hasLeft={$folderPane.value == FolderPaneMode.Normal || !$folderPane.value}>
    <LeftPane slot="left" />
    <hbox flex class="main" slot="right">
      <hbox flex class="reading-pane-layout">
        <SplitterBidirectional horizontal={position == "bottom"}
          hasSecond={position == "right" || position == "bottom"}
          name={position == "bottom" ? "lookout.mail.readingPane.bottom" : "lookout.mail.readingPane.right"}
          initialSecondRatio={position == "bottom" ? 1.4 : 1.6}
          firstMinPx={position == "bottom" ? 160 : 300}
          secondMinPx={position == "bottom" ? 200 : 320}>
          <hbox flex class="part list" slot="first"
            class:top={position == "bottom"}
            class:single={position != "right" && position != "bottom"}>
            <MessageListPane bind:this={listPane}
              folder={selectedFolder}
              listMessages={messages}
              selection={selectedMessages}
              bind:selectedMessage
              {isSearchResult}
              {onMoreResults}
              {showFolder}
              {highlight}
              {isLoading} />
          </hbox>
          <hbox flex class="part reading" slot="second"
            class:right={position == "right"}
            class:bottom={position == "bottom"}>
            <MessageDisplay
              message={$selectedMessages.length > 1 ? null : selectedMessage}
              selectedCount={$selectedMessages.length} />
          </hbox>
        </SplitterBidirectional>
      </hbox>
      {#if $toDoBar.value?.length}
        <ToDoBar parts={$toDoBar.value} />
      {/if}
    </hbox>
  </Splitter>
</hbox>

<script lang="ts" context="module">
  export type ReadingPanePosition = "right" | "bottom" | "off";
</script>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { FolderTreeActions } from "../FolderPane/FolderTreeActions";
  import LeftPane, { FolderPaneMode } from "../LeftPane/LeftPane.svelte";
  import FolderPaneMinimized from "../../Shared/FolderPaneMinimized.svelte";
  import MessageListPane from "./MessageListPane.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import ToDoBar, { type ToDoBarPart } from "../ToDoBar/ToDoBar.svelte";
  import Splitter from "../../../frontend/Shared/Splitter.svelte";
  import SplitterBidirectional from "../../../frontend/Shared/SplitterBidirectional.svelte";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import type { ArrayColl, Collection } from "svelte-collections";

  export let messages: Collection<EMail>;
  export let selectedFolder: Folder | null;
  export let selectedMessage: EMail | null;
  export let selectedMessages: ArrayColl<EMail>;
  export let isSearchResult = false;
  export let showFolder = false;
  export let highlight: string | null = null;
  export let isLoading = false;
  export let onMoreResults: () => Promise<void> = null;
  export let listPane: MessageListPane = null;

  const readingPane = getLocalStorage<ReadingPanePosition>("lookout.mail.readingPane", "right");
  const folderPane = getLocalStorage<FolderPaneMode>("lookout.mail.folderPane", FolderPaneMode.Normal);
  const toDoBar = getLocalStorage<ToDoBarPart[]>("lookout.mail.toDoBar", []);
  $: position = $readingPane.value;
</script>

<style>
  .panes {
    min-height: 0;
    min-width: 0;
  }
  .main {
    min-width: 0;
    min-height: 0;
  }
  /* <copied to="../../Calendar/CalendarApp.svelte"> */
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
  /* </copied> */
</style>
