{#if accounts?.hasItems}
  {#if activeTab == FilesView.CloudStorage}
  <AccountList {accounts} bind:selectedAccount />
  {/if}
  <FolderList folders={rootDirs} bind:selectedFolder bind:selectedFolders />
  {#if selectedFolder}
  <TagsList folder={selectedFolder} bind:searchFiles />
  {/if}
{:else}
  <hbox class="warn">
    {$t`No file sharing accounts configured` }
  </hbox>
{/if}

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import { FileOrDirectory } from "../../../logic/Files/FileOrDirectory";
  import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import { myHarddrive } from "../../../logic/Files/Harddrive/HarddriveAccount";
  import { selectedFile } from "../selected";
  import { appGlobal } from "../../../logic/app";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import TagsList from "./TagsList.svelte";
  import { FilesView } from "../LeftPane/ViewSwitcher.svelte";
  import { ArrayColl, Collection } from 'svelte-collections';
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  /** The list of files and folders to show on the right pane
   * in/out only */
  export let listFiles: Collection<File>;
  export let listDirs: Collection<Directory>;
  export let activeTab: FilesView;

  $: accounts = activeTab == FilesView.CloudStorage
    ? appGlobal.fileSharingAccounts.filterObservable(acc => acc != myHarddrive)
    : new ArrayColl([myHarddrive]);
  let selectedAccount: FileSharingAccount = myHarddrive;
  let selectedFolder: Directory;
  let selectedFolders: ArrayColl<Directory>;
  let searchFiles: ArrayColl<FileOrDirectory> | null;

  $: rootDirs = selectedAccount?.rootDirs ?? new ArrayColl<Directory>();

  $: selectedFolder, catchErrors(changeDir)
  async function changeDir() {
    listDirs = null;
    listFiles = null;
    if (!selectedFolder) {
      return;
    }
    await selectedFolder.listContents();
    listDirs = selectedFolder.subDirs;
    listFiles = selectedFolder.files;
  }

  $: $selectedFile instanceof Directory && changeToDir($selectedFile)
  function changeToDir(folder: Directory) {
    selectedFolder = folder;
  }
</script>

<style>
  .warn {
    padding: 24px;
    flex-wrap: wrap;
  }
</style>
