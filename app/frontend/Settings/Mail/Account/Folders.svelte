<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<vbox flex>
  <h2>{$t`Folders`}</h2>
  <hbox class="subtitle">{$t`Rename folders, set special folders, share them with others`}</hbox>

  {#if $mailAccount?.isLoggedIn && $mailAccount.rootFolders.hasItems}
    <Splitter name="settings-mail-folders" initialRightRatio={4}>
      <FolderList folders={mailAccount.rootFolders} bind:selectedFolder={folder} bind:selectedFolders slot="left" />
      <vbox class="right" slot="right">
        {#if folder}
          <FolderProperties {folder} />
        {/if}
      </vbox>
    </Splitter>
  {:else if !$mailAccount?.isLoggedIn}
    {$t`Please log in to account ${mailAccount?.name} first`}
    <!--<Button label="Login" onClick={() => mailAccount.login(true)} />-->
  {/if}
</vbox>


<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { Folder } from "../../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import FolderProperties from "../../../Mail/FolderProperties.svelte";
  import FolderList from "../../../Mail/LeftPane/FolderList.svelte";
  import Splitter from "../../../Shared/Splitter.svelte";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  export let folder: Folder = null;
  export let account: Account = folder?.account;

  $: mailAccount = account as MailAccount;
  let selectedFolders: ArrayColl<Folder>;
</script>

<style>
  h2 {
    margin-block-start: 0px;
    margin-block-end: 0px;
  }
  .subtitle {
    margin-block-end: 16px;
  }
  .right {
    margin: 0px 32px;
    max-width: 55em;
  }
</style>
