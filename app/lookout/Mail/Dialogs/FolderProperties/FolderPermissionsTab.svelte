<vbox class="permissions">
  {#if isLoading}
    <hbox class="lo-secondary">{$t`Loading…`}</hbox>
  {/if}
  <ListView items={permissions.entries} bind:selected
    columns={[{ label: $t`Name` }, { label: $t`Permission Level`, width: "200px" }]}
    label={$t`Permissions`} height="150px" let:item>
    <span title={item.person.emailAddress}>{item.name}</span>
    <span title={item.level ? null : $t`The server doesn't tell the permission level of existing permissions`}>
      {item.level ? FolderPermissions.levelLabel(item.level) : "–"}
    </span>
    <span slot="empty">{$t`You have not given anybody access yet.`}</span>
  </ListView>
  <hbox class="list-buttons">
    <DialogButton label={$t`Add…`} onClick={() => { isAdding = true; }} />
    <DialogButton label={$t`Remove`} disabled={!selected && $t`Select a person first`} onClick={onRemove} />
  </hbox>
  <GroupBox label={$t`Permissions`} disabled={!selected}>
    <hbox class="level-row">
      <span>{$t`Permission Level:`}</span>
      <ComboBox label={$t`Permission Level:`} options={levelOptions} value={selected?.level ?? null}
        placeholder={selected && !selected.level ? "–" : null}
        disabled={!selected && $t`Select a person first`}
        onChange={level => { permissions.setLevel(selected, level); changed(); }} width="100%" />
    </hbox>
    <grid class="rights">
      <GroupBox label={$t`Read`} disabled={!canEditRights}>
        {#each [Right.Read] as right}
          <CheckBox label={FolderPermissions.rightLabel(right)} checked={has(selected, right, version)}
            disabled={!canEditRights} onChange={granted => setRight(right, granted)} />
        {/each}
      </GroupBox>
      <GroupBox label={$t`Write`} disabled={!canEditRights}>
        {#each [Right.Create, Right.CreateSubfolders, Right.FlagChange] as right}
          <CheckBox label={FolderPermissions.rightLabel(right)} checked={has(selected, right, version)}
            disabled={!canEditRights} onChange={granted => setRight(right, granted)} />
        {/each}
      </GroupBox>
      <GroupBox label={$t`Delete items`} disabled={!canEditRights}>
        {#each [Right.Delete] as right}
          <CheckBox label={FolderPermissions.rightLabel(right)} checked={has(selected, right, version)}
            disabled={!canEditRights} onChange={granted => setRight(right, granted)} />
        {/each}
      </GroupBox>
      <GroupBox label={$t`Other`} disabled={!canEditRights}>
        {#each [Right.DeleteFolder] as right}
          <CheckBox label={FolderPermissions.rightLabel(right)} checked={has(selected, right, version)}
            disabled={!canEditRights} onChange={granted => setRight(right, granted)} />
        {/each}
      </GroupBox>
    </grid>
  </GroupBox>
  <hbox class="scope">
    <Radio label={$t`This folder`} bind:group={permissions.allFolders} value={false} />
    <CheckBox label={$t`Include subfolders`} bind:checked={permissions.includeSubfolders}
      disabled={permissions.allFolders} />
    <Radio label={$t`All folders of ${permissions.account.name}`} bind:group={permissions.allFolders} value={true} />
  </hbox>
</vbox>
{#if isAdding}
  <SelectNamesDialog title={$t`Add Users`} fields={[addField]}
    onOK={onAdded} onCancel={() => { isAdding = false; }} />
{/if}

<script lang="ts">
  import { MailShareCombinedPermissions, MailShareIndividualPermissions as Right } from "../../../../logic/Mail/Folder";
  import { FolderPermissions, type FolderPermission } from "./FolderPermissions";
  import { SelectNamesField } from "../../Composer/SelectNames";
  import SelectNamesDialog from "../../Composer/SelectNamesDialog.svelte";
  import ListView from "../../../Shared/Form/ListView.svelte";
  import GroupBox from "../../../Shared/Form/GroupBox.svelte";
  import ComboBox from "../../../Shared/Form/ComboBox.svelte";
  import CheckBox from "../../../Shared/Form/CheckBox.svelte";
  import Radio from "../../../Shared/Form/Radio.svelte";
  import DialogButton from "../../../Shared/Dialog/DialogButton.svelte";
  import { catchErrors, showError } from "../../../../frontend/Util/error";
  import { onMount } from "svelte";
  import { t } from "../../../../l10n/l10n";

  export let permissions: FolderPermissions;
  export let onChange: () => void;

  let selected: FolderPermission = null;
  let isLoading = true;
  let isAdding = false;
  let addField = new SelectNamesField($t`Add`);
  let version = 0;

  $: levelOptions = permissions.account.sharePermissionLevels
    .map(level => ({ value: level, label: FolderPermissions.levelLabel(level) }));
  $: canEditRights = !!selected && permissions.account.sharePermissionLevels.includes(MailShareCombinedPermissions.Custom);

  onMount(() => catchErrors(load));
  async function load() {
    try {
      await permissions.load();
      permissions = permissions;
    } finally {
      isLoading = false;
    }
  }

  function has(entry: FolderPermission, right: Right, _version: number): boolean {
    return !!entry?.rights.includes(right);
  }

  function setRight(right: Right, granted: boolean) {
    permissions.setRight(selected, right, granted);
    changed();
  }

  function changed() {
    version++;
    permissions = permissions;
    selected = selected;
    onChange();
  }

  function onAdded() {
    isAdding = false;
    for (let person of addField.picks.contents) {
      try {
        selected = permissions.add(person);
      } catch (ex) {
        showError(ex);
      }
    }
    addField = new SelectNamesField($t`Add`);
    changed();
  }

  function onRemove() {
    permissions.remove(selected);
    selected = null;
    changed();
  }
</script>

<style>
  .permissions {
    gap: 8px;
    padding-top: 16px;
  }
  .list-buttons {
    justify-content: center;
    gap: 8px;
  }
  .level-row {
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .rights {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 6px;
  }
  .scope {
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
</style>
