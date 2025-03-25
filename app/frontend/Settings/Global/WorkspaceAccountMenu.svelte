<ButtonMenu bind:isMenuOpen>
  <RoundButton
    slot="control"
    onClick={onMenuToggle}
    label={$t`Move`}
    icon={DotsIcon}
    iconSize="10px"
    padding="3px"
    border={false}
    classes="small plain"
    />
  {#if $workspaces.length > 1}
    <MenuLabel label={$t`Move to workspace`} />
    {#each workspaces.each as otherWorkspace}
      {#if otherWorkspace != workspace}
        <MenuItem
          onClick={() => onMove(otherWorkspace)}
          label={otherWorkspace.name}
          tooltip={$t`Move the account to this workspace`} />
      {/if}
    {/each}
    <MenuDivider />
  {/if}
  <MenuItem
    onClick={onOpenAccount}
    label={$t`Account settings`}
    tooltip={$t`Open settings of this account`} />
</ButtonMenu>

<script lang="ts">
  import { Workspace } from "../../../logic/Abstract/Workspace";
  import { Account } from "../../../logic/Abstract/Account";
  import { accountSettings } from "../SettingsCategories";
  import { selectedCategory, selectedAccount } from "../Window/selected";
  import { appGlobal } from "../../../logic/app";
  import { changedWorkspace, selectedWorkspace } from "../../MainWindow/Selected";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DotsIcon from "lucide-svelte/icons/ellipsis";
  import { t } from "../../../l10n/l10n";

  export let account: Account;
  export let workspace: Workspace;

  let workspaces = appGlobal.workspaces;

  function onOpenAccount() {
    $selectedAccount = account;
    $selectedCategory = accountSettings.find(cat => account instanceof cat.type && cat.isMain);
  }
  async function onMove(otherWorkspace: Workspace) {
    account.workspace = otherWorkspace;
    $changedWorkspace++;
    $selectedWorkspace = $selectedWorkspace;
    await account.save();
  }

  let isMenuOpen = false;
  function onMenuToggle(event: Event) {
    event.stopPropagation();
    isMenuOpen = !isMenuOpen;
  }
</script>

<style>
</style>
