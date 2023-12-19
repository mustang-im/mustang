{#if view == "chat"}
  <MailChat {accounts} />
{:else if view == "vertical"}
 <VerticalLayout {accounts} bind:selectedAccount bind:selectedFolder bind:selectedMessage />
{:else}
  <ThreePane {accounts} bind:selectedAccount bind:selectedFolder bind:selectedMessage />
{/if}

<script lang="ts">
  import type { MailAccount, MsgFolder as Folder, Email as EMail } from "mustang-lib";
  import { appGlobal } from "../../logic/app";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
 import MailChat from "./MailChat/MailChat.svelte";
  import { onMount } from "svelte";
 
  let selectedAccount: MailAccount;
  let selectedFolder: Folder;
  let selectedMessage: EMail;

  $: accounts = appGlobal.emailAccounts;

  onMount(onLoad);
  async function onLoad() {
    try {
      for (let account of accounts) {
        if (!(await account.isLoggedIn()) && await account.haveStoredLogin()) {
          try {
            await account.login();
            await account.inbox.fetch();
          } catch (e) {
            showError(e); // TODO background error
          }
        }
      }
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
      await folder.fetch();
    } catch (ex) {
      showError(ex);
    }
  }

  let viewSetting = getLocalStorage("mail.view", "chat");
  $: view = $viewSetting.value;
</script>
