<Dialog title={$t`Rules and Alerts`} on:close={onCloseRequest} width="720px" height="600px">
  {#if edit}
    <RuleEditor {edit} onDone={onEditDone} />
  {:else}
    <hbox class="account-row">
      <label for="rules-account">{$t`Apply changes to this account:`}</label>
      <select id="rules-account" bind:value={account}>
        {#each $accounts.each as mailAccount}
          <option value={mailAccount}>{mailAccount.name}</option>
        {/each}
      </select>
    </hbox>
    <hbox class="toolbar">
      <DialogButton label={$t`New Rule…`} icon={NewIcon} classes="plain" onClick={onNew} />
      <DialogButton label={$t`Change Rule`} icon={EditIcon} classes="plain" hasMenu
        disabled={!selected && noSelection}
        onClick={() => { isChangeMenuOpen = !isChangeMenuOpen; }}
        bind:buttonEl={changeButton} />
      <Menu bind:isMenuOpen={isChangeMenuOpen} anchor={changeButton} placement="bottom-start">
        <MenuItem label={$t`Edit Rule Settings…`} icon={EditIcon} onClick={onEdit} />
        <MenuItem label={$t`Rename Rule`} icon={RenameIcon} onClick={() => renaming = selected} />
        <MenuDivider />
        <MenuItem label={$t`Move to Folder…`} icon={MoveIcon} onClick={() => folderAction = "move"} />
        <MenuItem label={$t`Copy to Folder…`} icon={CopyToFolderIcon} onClick={() => folderAction = "copy"} />
        <MenuItem label={$t`Delete Message`} icon={DeleteMessageIcon} onClick={() => catchErrors(onDeleteMessage)} />
      </Menu>
      <DialogButton label={$t`Copy`} icon={CopyIcon} classes="plain"
        tooltip={$t`Make a copy of this rule`}
        disabled={!selected && noSelection} onClick={onCopy} />
      <DialogButton label={$t`Delete`} icon={DeleteIcon} classes="plain"
        disabled={!selected && noSelection} onClick={onDelete} />
      <hbox class="separator" />
      <DialogButton label="" icon={MoveUpIcon} classes="plain"
        tooltip={$t`Move Up`}
        disabled={!canMoveUp && $t`This rule runs first`}
        onClick={() => onMove(-1)} />
      <DialogButton label="" icon={MoveDownIcon} classes="plain"
        tooltip={$t`Move Down`}
        disabled={!canMoveDown && $t`This rule runs last`}
        onClick={() => onMove(1)} />
    </hbox>
    <vbox flex class="list">
      <FastList items={rules} bind:selectedItem={selected} columns="minmax(0, 1fr) 140px">
        <svelte:fragment slot="header">
          <hbox class="column-header">{$t`Rule (applied in the order shown)`}</hbox>
          <hbox class="column-header">{$t`Actions`}</hbox>
        </svelte:fragment>
        <svelte:fragment slot="row" let:item={rule}>
          <RuleRow {rule} onEdit={onEdit} />
        </svelte:fragment>
      </FastList>
      {#if $rules.isEmpty}
        <hbox class="empty lo-secondary">{$t`There are no rules. Click New Rule to create one.`}</hbox>
      {/if}
    </vbox>
    <hbox class="hint lo-secondary">
      <InfoIcon size={14} />
      {$t`Rules run in ${appName} when it downloads new messages.`}
    </hbox>
    <span class="description-label">{$t`Rule description (click an underlined value to edit):`}</span>
    <RuleDescriptionBox rule={selected} onEdit={onEdit} />
  {/if}
  <svelte:fragment slot="footer">
    <DialogButton label={$t`Close`} onClick={onCloseRequest} />
  </svelte:fragment>
</Dialog>
{#if renaming}
  <RenameRuleDialog rule={renaming} onDone={() => renaming = null} />
{/if}
{#if folderAction && selected}
  <RuleFolderDialog account={selected.account} folder={selected.toFolder}
    onChosen={onFolderChosen}
    onCancel={() => folderAction = null} />
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { appGlobal } from "../../../logic/app";
  import { appName } from "../../../logic/build";
  import { catchErrors } from "../../../frontend/Util/error";
  import { RuleEdit } from "./RuleEdit";
  import { RuleListActions } from "./RuleListActions";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import RuleEditor from "./RuleEditor.svelte";
  import RuleRow from "./RuleRow.svelte";
  import RuleDescriptionBox from "./RuleDescriptionBox.svelte";
  import RenameRuleDialog from "./RenameRuleDialog.svelte";
  import RuleFolderDialog from "./RuleFolderDialog.svelte";
  import FastList from "../../../frontend/Shared/FastList.svelte";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import NewIcon from "lucide-svelte/icons/list-plus";
  import EditIcon from "lucide-svelte/icons/pencil";
  import RenameIcon from "lucide-svelte/icons/text-cursor-input";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyToFolderIcon from "lucide-svelte/icons/folders";
  import DeleteMessageIcon from "lucide-svelte/icons/mail-x";
  import CopyIcon from "lucide-svelte/icons/copy";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import MoveUpIcon from "lucide-svelte/icons/arrow-up";
  import MoveDownIcon from "lucide-svelte/icons/arrow-down";
  import InfoIcon from "lucide-svelte/icons/info";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let editRule: FilterRuleAction | null = null;
  export let onClose: () => void;

  const accounts = appGlobal.emailAccounts;
  if (!accounts.contains(account)) {
    account = accounts.first;
  }
  let selected: FilterRuleAction | null = null;
  let edit: RuleEdit | null = editRule ? new RuleEdit(editRule) : null;
  let isChangeMenuOpen = false;
  let changeButton: HTMLButtonElement;
  let renaming: FilterRuleAction | null = null;
  let folderAction: "move" | "copy" | null = null;

  $: rules = account.filterRuleActions;
  let shownAccount: MailAccount | null = null;
  $: if (account != shownAccount) {
    shownAccount = account;
    selected = account.filterRuleActions.first ?? null;
  }
  $: noSelection = $t`Select a rule first`;
  $: canMoveUp = !!selected && $rules && RuleListActions.canMoveUp(rules, selected);
  $: canMoveDown = !!selected && $rules && RuleListActions.canMoveDown(rules, selected);

  function onNew() {
    let rule = new FilterRuleAction(account);
    edit = new RuleEdit(rule);
  }

  function onEdit() {
    if (!selected) {
      return;
    }
    edit = new RuleEdit(selected);
  }

  function onEditDone(saved: FilterRuleAction | null) {
    edit = null;
    if (saved) {
      selected = saved;
    }
  }

  async function onCopy() {
    selected = RuleListActions.copy(rules, selected);
    await account.save();
  }

  async function onDelete() {
    // <copied from="../../../frontend/Settings/Mail/Rules.svelte" onDelete()>
    if (selected.name && !confirm($t`Do you want to delete the rule '${selected.name}'?`)) {
      return;
    }
    account.filterRuleActions.remove(selected);
    await account.save();
    selected = null;
    // </copied>
  }

  async function onMove(offset: number) {
    RuleListActions.move(rules, selected, offset);
    await account.save();
  }

  async function onFolderChosen(folder: Folder) {
    RuleListActions.moveToFolder(selected, folder, folderAction == "copy");
    folderAction = null;
    await selected.account.save();
  }

  async function onDeleteMessage() {
    RuleListActions.deleteMessage(selected);
    await selected.account.save();
  }

  function onCloseRequest() {
    edit?.discard();
    edit = null;
    onClose();
  }
</script>

<style>
  .account-row {
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    margin-block-end: 8px;
  }
  .account-row select {
    min-width: 260px;
    height: 30px;
  }
  .toolbar {
    flex-shrink: 0;
    align-items: center;
    gap: 2px;
    margin-block-end: 6px;
    margin-inline-start: -8px;
  }
  .toolbar :global(.dialog-button) {
    padding: 0 8px;
  }
  .separator {
    width: 1px;
    height: 20px;
    margin: 0 6px;
    background-color: var(--lo-divider);
  }
  .list {
    position: relative;
    min-height: 120px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    overflow: hidden;
  }
  /* <copied from="../Composer/SelectNamesDialog.svelte"> */
  .list :global(.fast-list .header > *) {
    padding: 4px 8px;
    border-block-end: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    position: sticky;
    top: 0;
  }
  /* </copied> */
  .empty {
    position: absolute;
    inset: 48px 16px auto 16px;
    justify-content: center;
    text-align: center;
  }
  .hint {
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    margin-block: 6px 12px;
    font-size: var(--lo-font-size-small);
  }
  .description-label {
    flex-shrink: 0;
    margin-block-end: 4px;
  }
</style>
