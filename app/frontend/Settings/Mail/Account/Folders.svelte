<vbox flex>
  <h2>Folders</h2>
  <hbox class="subtitle">Rename folders, set special folders, share them with others</hbox>

  {#if $mailAccount?.isLoggedIn && $mailAccount.rootFolders.hasItems}
    <Splitter name="settings-mail-folders" initialRightRatio={4}>
      <FolderList folders={mailAccount.rootFolders} bind:selectedFolder={folder} slot="left" />
      <vbox class="right" slot="right">
        {#if folder}
          <FolderGeneral {folder} />
          <hbox flex />
          <FolderActions {folder}>
            <slot name="buttons-bottom-right" slot="buttons-bottom-right" />
          </FolderActions>
        {/if}
      </vbox>
    </Splitter>
  {:else if !$mailAccount?.isLoggedIn}
    Please log in to account {mailAccount?.name} first
    <!--<Button label="Login" onClick={() => mailAccount.login(true)} />-->
  {/if}
</vbox>


<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { Folder } from "../../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import FolderGeneral from "./FolderGeneral.svelte";
  import FolderActions from "./FolderActions.svelte";
  import FolderList from "../../../Mail/LeftPane/FolderList.svelte";
  import Splitter from "../../../Shared/Splitter.svelte";

  export let folder: Folder = null;
  export let account: Account = folder?.account;

  $: mailAccount = account as MailAccount;
</script>

<style>
  h2 {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .subtitle {
    margin-bottom: 16px;
  }
  .right {
    margin: 12px 32px;
  }
</style>
