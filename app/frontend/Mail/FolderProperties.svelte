<Splitter name="mail.3pane.folders" initialRightRatio={4}>
  <vbox flex class="folder-pane" slot="left">
    <AccountList accounts={$accounts} bind:selectedAccount>
      <hbox class="above-accounts" slot="top-right" />
    </AccountList>
    <FolderList bind:selectedFolder={folder}  folders={selectedAccount ? selectedAccount.rootFolders : new ArrayColl()} bind:selectedFolders />
  </vbox>
  <vbox class="main" slot="right" flex>
    <hbox class="top">
      <h2>{folder.name}</h2>
      <hbox flex />
      <hbox class="buttons">
        <RoundButton
          label={$t`Close`}
          icon={CloseIcon}
          iconSize="16px"
          on:click={onClose}
          />
        </hbox>
    </hbox>
    <FolderGeneral {folder} />
    <hbox flex />
    <FolderActions {folder}>
      <Button label={$t`Close`}
        icon={CloseIcon}
        slot="buttons-bottom-right"
        classes="close"
        on:click={onClose}
        />
    </FolderActions>
  </vbox>
</Splitter>

<script lang="ts" context="module">
  export const openFolderProperties = writable<boolean>();
</script>

<script lang="ts">
  import type { Folder } from "../../logic/Mail/Folder";
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import FolderGeneral from "../Settings/Mail/Account/FolderGeneral.svelte";
  import FolderActions from "../Settings/Mail/Account/FolderActions.svelte";
  import AccountList from "./LeftPane/AccountList.svelte";
  import FolderList from "./LeftPane/FolderList.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import Button from "../Shared/Button.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import CloseIcon from "lucide-svelte/icons/x";
  import { writable } from "svelte/store";
  import { ArrayColl, Collection } from "svelte-collections";
  import { t } from "svelte-i18n-lingui";

  export let folder: Folder; /** in/out */

  export let accounts: Collection<MailAccount>; /** in */
  export let selectedAccount: MailAccount; /** in/out */

  let selectedFolders: ArrayColl<Folder>;

  function onClose() {
    $openFolderProperties = false;
  }
</script>

<style>
  .above-accounts {
    height: 52px;
  }
  .main {
    margin: 12px 12px 12px 32px;
  }
  .buttons {
    align-items: start;
    justify-content: start;
  }
</style>
