<HeaderGroupBox>
  <hbox slot="header">
    {$workspace.name || $t`New`}
  </hbox>
  <svelte:fragment slot="buttons-top-right">
    {#if canRemove}
      <RoundButton
        label={$t`Delete this workspace`}
        onClick={onDelete}
        icon={DeleteIcon}
        />
    {/if}
  </svelte:fragment>
  <vbox class="content">
    <grid class="name">
      <label for="name">{$t`Name`}</label>
      <input type="email"
        bind:value={workspace.name}
        on:change
        required
        autofocus={!$workspace.name}
        name="name" class="name" />
      <input type="color"
        bind:value={workspace.color}
        on:change
        list="proposed-colors"
        name="color" />
    </grid>
    <hbox class="accounts">
      <WorkspaceAccounts title={$t`Mail`} allAccounts={appGlobal.emailAccounts} accountSettingsID="mail" {workspace} />
      <WorkspaceAccounts title={$t`Chat`} allAccounts={appGlobal.chatAccounts} accountSettingsID="chat" {workspace} />
      <WorkspaceAccounts title={$t`Meet`} allAccounts={appGlobal.meetAccounts} accountSettingsID="meet" {workspace} />
      <WorkspaceAccounts title={$t`Calendar`} allAccounts={appGlobal.calendars} accountSettingsID="calendar" {workspace} />
      <WorkspaceAccounts title={$t`Addressbook`} allAccounts={appGlobal.addressbooks} accountSettingsID="contacts" {workspace} />
    </hbox>
  </vbox>
</HeaderGroupBox>

<!-- <copied from="AccountGeneral.svelte" /> -->
<datalist id="proposed-colors">
  {#each accountColors as color}
    <option value={color}></option>
  {/each}
</datalist>

<script lang="ts">
  import { Workspace, accountColors, saveWorkspaces } from "../../../logic/Abstract/Workspace";
  import { appGlobal } from "../../../logic/app";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import WorkspaceAccounts from "./WorkspaceAccounts.svelte";

  export let workspace: Workspace;

  let workspaces = appGlobal.workspaces;
  $: canRemove = $workspaces.length > 1;

  async function onDelete() {
    assert(workspaces.length > 1, $t`Cannot remove the last workspace`);
    workspaces.remove(workspace);
    await saveWorkspaces();
  }
</script>

<style>
  grid.name {
    grid-template-columns: max-content auto max-content;
    gap: 8px 24px;
    max-width: 30em;
    margin-block-end: 24px;
  }
  .accounts {
    flex-wrap: wrap;
    max-width: 100%;
  }
</style>
