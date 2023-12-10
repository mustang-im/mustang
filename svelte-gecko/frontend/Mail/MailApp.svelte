{#if true}
  <MailChat {accounts} />
{:else}
  <ThreePane {accounts} bind:selectedAccount bind:selectedFolder bind:selectedMessage />
{/if}

<script lang="ts">
  //import type { Account, MsgFolder, Email } from "mustang-lib";
  import type { MailAccount } from "../../logic/Mail/Account";
  import type { Folder } from "../../logic/Mail/Folder";
  import type { EMail } from "../../logic/Mail/Message";
  import { appGlobal } from "../../logic/app";
  import { showError } from "../Util/error";
  import ThreePane from "./3Pane.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
  import { onMount } from "svelte";

  let selectedAccount: MailAccount;
  let selectedFolder: Folder;
  let selectedMessage: EMail;

  $: accounts = appGlobal.emailAccounts;

  onMount(onLoad);
  async function onLoad() {
    try {
      /*
      for (let account of accounts.contents) {
        if (await account.haveStoredLogin()) {
          try {
            await account.login();
            await account.inbox.fetch();
          } catch (e) { backgroundError(e); }
        }
      }
      */
    } catch (ex) {
      showError(ex);
    }
  }

  $: loadFolder(selectedFolder);
  async function loadFolder(folder: Folder) {
    try {
      if (!folder) {
        return;
      }
      // await folder.fetch();
    } catch (ex) {
      showError(ex);
    }
  }
</script>
