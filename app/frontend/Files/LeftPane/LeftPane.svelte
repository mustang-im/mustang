<vbox flex class="left-pane">
  <hbox class="top">
    <vbox class="island">
      <ViewSwitcher bind:active={activeTab} />
    </vbox>
    <hbox flex />
  </hbox>

  {#if activeTab == FilesView.Recent}
    <RecentList bind:viewFile />
  {:else if activeTab == FilesView.Person}
    <PersonsPane bind:listFiles bind:listDirs />
  {:else if activeTab == FilesView.Project}
    <!---->
  {:else if activeTab == FilesView.Search}
    <SearchPane bind:listFiles bind:listDirs on:clear={endSearchMode} />
  {:else if activeTab == FilesView.CloudStorage || activeTab == FilesView.Harddrive}
    <FolderPane bind:listFiles bind:listDirs {activeTab} />
  {/if}
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import FolderPane from "../FolderLeftPane/FolderPane.svelte";
  import SearchPane from "../Search/SearchPane.svelte";
  import RecentList from "./RecentList.svelte";
  import PersonsPane from "./PersonsPane.svelte";
  import ViewSwitcher, { FilesView } from "./ViewSwitcher.svelte";
  import { Collection } from 'svelte-collections';

  /** The list of files and folders to show on the right pane
   * in/out only */
  export let listFiles: Collection<File>;
  export let listDirs: Collection<Directory>;
  /** out only */
  export let viewFile: File | null = null;

  let activeTab = FilesView.Harddrive;

  $: if (!!$globalSearchTerm) openSearchPane();
  function openSearchPane() {
    activeTab = FilesView.Search;
  }
  // Search.svelte is removed here above, and therefore cannot react anymore, so have to do it here.
  // Reproduction: window title | search field | (x) button
  $: if ($globalSearchTerm == null) endSearchMode();
  function endSearchMode() {
    activeTab = FilesView.Harddrive;
  }
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%);
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }

  .left-pane :global(.persons) {
    margin-block-start: 8px;
  }
  .left-pane :global(.account-list) {
    margin-block-start: -4px;
  }
  .left-pane :global(.search) {
    margin-block-start: -2px;
  }
  .top :global(.svelteui-Tab) {
    padding: 8px 12px;
    height: unset;
  }
  .island {
    margin: 8px 12px;
  }
</style>
