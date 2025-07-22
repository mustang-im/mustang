<vbox class="account-general">
  <HeaderGroupBox>
    <hbox slot="header">{$account.name}</hbox>
    <svelte:fragment slot="buttons-top-right">
      <RoundButton
        label={$t`Delete account`}
        onClick={onDelete}
        icon={DeleteIcon}
        />
    </svelte:fragment>
    <vbox class="content">
      <grid>
        <label for="name">{$t`Account name`}</label>
        <input type="text" bind:value={account.name} name="name" on:change={onChange} />
        <input type="color" bind:value={account.color} name="color" on:change={onChange} list="proposed-colors" />
        {#if account.icon && typeof(account.icon) == "string"}
          <img src={account.icon} width="24px" height="24px" alt="" />
        {:else}
          <hbox class="icon placeholder" />
        {/if}

        <label for="workspace">{$t`Workspace`}</label>
        <select bind:value={account.workspace} name="workspace">
          {#each appGlobal.workspaces.each as workspace}
            <option value={workspace}>{workspace.name}</option>
          {/each}
        </select>
        <hbox />
        <hbox />

        {#if account instanceof MailAccount || account instanceof ChatAccount || account instanceof MeetAccount}
          <label for="realname" title={$t`Your real name, as shown to other people when you are sending messages`}>{$t`Your name`}</label>
          <input type="text" bind:value={account.realname} name="realname" on:change={onChange}
            title={$t`Your real name, as shown to other people when you are sending messages`} />
          <hbox />
          <hbox />
        {/if}
      </grid>
    </vbox>
  </HeaderGroupBox>
</vbox>

<!-- <copied to="WorkspaceBlock.svelte" /> -->
<datalist id="proposed-colors">
  {#each accountColors as color}
    <option value={color}></option>
  {/each}
</datalist>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { selectedAccount, selectedFolder, selectedMessage, selectedMessages } from "../Mail/Selected";
  import { selectedCategory } from "./Window/selected";
  import { settingsCategories } from "./SettingsCategories";
  import { accountColors } from "../../logic/Abstract/Workspace";
  import { MailAccount } from "../../logic/Mail/MailAccount";
  import { ChatAccount } from "../../logic/Chat/ChatAccount";
  import { MeetAccount } from "../../logic/Meet/MeetAccount";
  import { appGlobal } from "../../logic/app";
  import { appName } from "../../logic/build";
  import { catchErrors } from "../Util/error";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { useDebounce } from '@svelteuidev/composables';
  import { t } from "../../l10n/l10n";

  export let account: Account;

  const onChange = useDebounce(() => catchErrors(onSave), 500);
  async function onSave() {
    await account.save();
  }

  async function onDelete() {
    let confirmed = confirm($t`Are you sure that you want to the delete account ${account.name} from ${appName} and all related data?`);
    if (!confirmed) {
      return;
    }
    await account.deleteIt();

    // Reset selected
    if ($selectedAccount == account) {
      $selectedAccount = appGlobal.emailAccounts.first;
      $selectedFolder = $selectedAccount?.inbox;
      $selectedMessage = null;
      $selectedMessages.clear();
    }
  }
</script>

<style>
  .account-general {
    max-width: 40em;
  }

  grid {
    grid-template-columns: max-content auto max-content max-content;
    gap: 8px 24px;
  }

  .icon.placeholder {
    width: 24px;
    height: 24px;
  }

  input[name] {
    margin-block-end: 24px;
  }
</style>
