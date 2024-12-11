<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<Splitter name="mail.3pane.folders" initialRightRatio={4}>
  <LeftPane accounts={$accounts} bind:selectedAccount
    {folders} bind:selectedFolder bind:selectedFolders bind:searchMessages
    slot="left" />
  <SplitterHorizontal slot="right" name="mail.3pane.msgs" initialBottomRatio={2}>
    <vbox flex class="message-list-pane" slot="top">
      <TableMessageList {messages} bind:selectedMessage bind:selectedMessages />
    </vbox>
    <vbox flex class="message-display-pane" slot="bottom">
      {#if selectedMessage}
        <MessageDisplay message={selectedMessage} />
      {:else}
        <StartPage />
      {/if}
    </vbox>
  </SplitterHorizontal>
</Splitter>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";

  import TableMessageList from "./TableMessageList.svelte";
  import LeftPane from "../LeftPane/LeftPane.svelte";
  import MessageDisplay from "../Message/MessageDisplay.svelte";
  import StartPage from "../StartPage.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import SplitterHorizontal from "../../Shared/SplitterHorizontal.svelte";
  import type { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let messages: ArrayColl<EMail>; /** in */
  export let folders: Collection<Folder>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedMessage: EMail; /** in/out */
  export let selectedMessages: ArrayColl<EMail>; /** in/out */
  let selectedFolders: ArrayColl<Folder>;
</script>

<style>
  .message-list-pane,
  .message-display-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .message-display-pane {
    flex: 2 0 0;
  }
</style>
