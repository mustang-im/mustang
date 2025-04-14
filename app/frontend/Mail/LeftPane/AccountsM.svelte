<vbox flex class="accounts-pane">
  <AccountList {accounts} bind:selectedAccount />
  <FolderList {folders} bind:selectedFolder bind:selectedFolders on:click={() => catchErrors(onFolderSelected)} />
  <AccountsBarM {selectedAccount} {selectedFolder} />
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { type Folder } from "../../../logic/Mail/Folder";
  import { goTo } from "../../AppsBar/selectedApp";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import AccountsBarM from "./AccountsBarM.svelte";
  import { catchErrors } from "../../Util/error";
  import type { ArrayColl, Collection } from 'svelte-collections';
  import { sleep, assert } from "../../../logic/util/util";

  export let accounts: Collection<MailAccount>; /** in */
  export let folders: Collection<Folder>; /** in */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  let selectedFolders: ArrayColl<Folder>; /** in/out */

  async function onFolderSelected() {
    await sleep(0.1); // wait for `<FolderList>` to set `selectedFolder`
    assert(selectedFolder, "Need folder");
    goTo("/mail/folder/message-list");
  }
</script>

<style>
  .accounts-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 2;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }

  .accounts-pane :global(.account-list) {
    margin-block-start: -4px;
  }
</style>
