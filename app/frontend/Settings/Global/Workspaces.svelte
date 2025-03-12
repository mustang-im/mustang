<vbox flex class="page">
  <PageHeader title={$t`Workspaces`} subtitle={$t`Your work-life balance: Mute some accounts at times to focus or relax.\nThe circle in the window header allows you to choose which workspace to focus on.`}>
    <RoundButton
      label={$t`Add`}
      onClick={onAdd}
      icon={AddIcon}
      slot="buttons-top-right"
      />
  </PageHeader>

  {#each $workspaces.each as workspace}
    <WorkspaceBlock {workspace} on:change={onSaveDelayed}/>
  {/each}

  {#if haveUnassigned}
    <HeaderGroupBox>
      <hbox slot="header">
        {$t`Unassigned`}
      </hbox>
      <hbox class="accounts">
        <WorkspaceAccounts title={$t`Mail`} allAccounts={appGlobal.emailAccounts} accountSettingsID="mail" workspace={null} />
        <WorkspaceAccounts title={$t`Chat`} allAccounts={appGlobal.chatAccounts} accountSettingsID="chat" workspace={null} />
        <WorkspaceAccounts title={$t`Meet`} allAccounts={appGlobal.meetAccounts} accountSettingsID="meet" workspace={null} />
        <WorkspaceAccounts title={$t`Calendar`} allAccounts={appGlobal.calendars} accountSettingsID="calendar" workspace={null} />
        <WorkspaceAccounts title={$t`Addressbook`} allAccounts={appGlobal.addressbooks} accountSettingsID="contacts" workspace={null} />
      </hbox>
    </HeaderGroupBox>
  {/if}

  <hbox class="buttons">
    <Button label={$t`Save`}
      classes="save"
      icon={SaveIcon}
      onClick={onSave}
      />
  </hbox>
</vbox>

<script lang="ts">
  import { Workspace, randomAccountColor, saveWorkspaces } from "../../../logic/Abstract/Workspace";
  import { appGlobal } from "../../../logic/app";
  import WorkspaceBlock from "./WorkspaceBlock.svelte";
  import PageHeader from "../Shared/PageHeader.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import SaveIcon from "lucide-svelte/icons/save";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { useDebounce } from '@svelteuidev/composables';
  import { t } from "../../../l10n/l10n";
  import WorkspaceAccounts from "./WorkspaceAccounts.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";

  $: workspaces = appGlobal.workspaces;

  $: haveUnassigned =
    appGlobal.emailAccounts.find(acc => !acc.workspace) ||
    appGlobal.chatAccounts.find(acc => !acc.workspace) ||
    appGlobal.meetAccounts.find(acc => !acc.workspace) ||
    appGlobal.calendars.find(acc => !acc.workspace) ||
    appGlobal.addressbooks.find(acc => !acc.workspace);

  function onAdd() {
    let workspace = new Workspace("", randomAccountColor(), null);
    workspaces.add(workspace);
  }
  async function onSave() {
    assert(workspaces.hasItems, $t`Need at least 1 workspace`);
    for (let workspace of workspaces) {
      assert(workspace.name, $t`Please enter a workspace name`);
    }
    await saveWorkspaces();
  }
  const onSaveDelayed = useDebounce(() => catchErrors(onSave), 500);
</script>

<style>
  .page {
    max-width: 45em;
  }
  .buttons {
    justify-content: end;
    margin-block-start: 64px;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
  .accounts {
    flex-wrap: wrap;
  }
</style>
