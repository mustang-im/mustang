{#if wizard}
  <RulesWizard model={wizard} onFinish={onWizardFinish} onCancel={onClose} />
{:else if createdRule}
  <RuleMessageBox title={$t`Success`} message={$t`The rule "${createdRule.name}" has been created.`}
    onAnswer={onClose} />
{:else}
  <Dialog title={$t`Create Rule`} on:close={onClose} width="540px">
    <fieldset>
      <legend>{$t`When I get email with all of the selected conditions`}</legend>
      <grid class="fields">
        <label class="check from" class:disabled={!quickRule.sender}
          title={quickRule.sender ? null : $t`The sender is not in your address book`}>
          <input type="checkbox" bind:checked={quickRule.fromSender} disabled={!quickRule.sender} />
          {$t`From ${quickRule.senderName}`}
        </label>
        <label class="check">
          <input type="checkbox" bind:checked={quickRule.hasText} />
          {$t`Subject or body contains`}
        </label>
        <input type="text" class="value lo-text-field" bind:value={quickRule.text}
          aria-label={$t`Subject or body contains`}
          on:input={() => quickRule.hasText = !!quickRule.text} />
      </grid>
    </fieldset>
    <fieldset>
      <legend>{$t`Do the following`}</legend>
      <grid class="fields">
        <label class="check">
          <input type="checkbox" bind:checked={quickRule.moveToFolder} />
          {$t`Move the item to folder:`}
        </label>
        <hbox class="folder-row">
          <input type="text" class="value folder lo-text-field" readonly value={quickRule.folder?.name ?? ""}
            aria-label={$t`Folder`} />
          <DialogButton label={$t`Select Folder…`} onClick={() => { isChoosingFolder = true; }} />
        </hbox>
        <label class="check wide">
          <input type="checkbox" bind:checked={quickRule.markAsRead} />
          {$t`Mark it as read`}
        </label>
        <label class="check wide">
          <input type="checkbox" bind:checked={quickRule.flag} />
          {$t`Flag message for follow up`}
        </label>
      </grid>
    </fieldset>
    <svelte:fragment slot="footer">
      <DialogButton label={$t`OK`} primary onClick={onOK} disabled={quickRule.disabledReason ?? false} />
      <DialogButton label={$t`Cancel`} onClick={onClose} />
      <DialogButton label={$t`Advanced Options…`} onClick={onAdvanced}
        tooltip={$t`Choose more conditions and actions in the Rules Wizard`} />
    </svelte:fragment>
  </Dialog>
  {#if isChoosingFolder}
    <RuleFolderDialog account={quickRule.account} folder={quickRule.folder}
      onChosen={onFolderChosen}
      onCancel={() => isChoosingFolder = false} />
  {/if}
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { UserError } from "../../../logic/util/util";
  import { QuickRule } from "./QuickRule";
  import { RuleWizardModel } from "./RuleWizardModel";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import RulesWizard from "./RulesWizard.svelte";
  import RuleFolderDialog from "./RuleFolderDialog.svelte";
  import RuleMessageBox from "./RuleMessageBox.svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  export let onClose: () => void;

  let quickRule = new QuickRule(message);
  let isChoosingFolder = false;
  let wizard: RuleWizardModel | null = null;
  let createdRule: FilterRuleAction | null = null;

  function onFolderChosen(folder: Folder) {
    quickRule.folder = folder;
    quickRule.moveToFolder = true;
    isChoosingFolder = false;
  }

  async function onOK() {
    if (quickRule.disabledReason) {
      throw new UserError(quickRule.disabledReason);
    }
    createdRule = await quickRule.save();
  }

  function onAdvanced() {
    wizard = RuleWizardModel.forRule(quickRule.createRule(), true);
  }

  async function onWizardFinish(rule: FilterRuleAction) {
    // <copied from="../../../frontend/Settings/Mail/Rules.svelte" onSave()>
    rule.account.filterRuleActions.add(rule);
    await rule.account.save();
    // </copied>
    onClose();
  }
</script>

<style>
  fieldset {
    margin: 0 0 12px 0;
    padding: 6px 12px 12px 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
  legend {
    padding: 0 4px;
    color: var(--lo-fg-secondary);
  }
  .fields {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 8px 12px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .check.from,
  .check.wide {
    grid-column: 1 / -1;
  }
  .check.disabled {
    color: var(--lo-fg-disabled);
  }
  .value {
    min-width: 0;
  }
  .folder-row {
    align-items: center;
    gap: 8px;
  }
  .folder-row .value {
    flex: 1 1 0;
  }
  .value.folder {
    background-color: var(--lo-pane-alt-bg);
  }
</style>
