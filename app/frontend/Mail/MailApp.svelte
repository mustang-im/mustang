{#if view == "chat"}
  <MailChat {accounts} />
{:else if view == "vertical"}
 <VerticalLayout {accounts} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} />
{:else}
  <ThreePane {accounts} bind:selectedAccount={$selectedAccount} bind:selectedFolder={$selectedFolder} bind:selectedMessage={$selectedMessage} />
{/if}

<script lang="ts">
  import type { Folder } from "../../logic/Mail/Folder";
  import { selectedAccount, selectedFolder, selectedMessage } from "./Selected";
  import { appGlobal } from "../../logic/app";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { showError } from "../Util/error";
  import ThreePane from "./3pane/3Pane.svelte";
  import VerticalLayout from "./Vertical/VerticalLayout.svelte";
  import MailChat from "./MailChat/MailChat.svelte";
 
  $: accounts = appGlobal.emailAccounts;

  $: loadFolder($selectedFolder);
  async function loadFolder(folder: Folder) {
    try {
      if (!folder) {
        return;
      }
      await folder.listMessages();
    } catch (ex) {
      showError(ex);
    }
  }

  let viewSetting = getLocalStorage("mail.view", "chat");
  $: view = $viewSetting.value;
</script>
