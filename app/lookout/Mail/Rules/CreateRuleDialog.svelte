{#if advancedRule}
  <RulesDialog account={quickRule.account} editRule={advancedRule} {onClose} />
{:else}
  <Dialog title={$t`Create Rule`} onClose={onClose} width="520px">
    <fieldset>
      <legend>{$t`When I get email with all of the selected conditions`}</legend>
      <label class="check" class:disabled={!quickRule.sender}
        title={quickRule.sender ? null : $t`The sender is not in your address book`}>
        <input type="checkbox" bind:checked={quickRule.fromSender} disabled={!quickRule.sender} />
        {$t`From ${quickRule.senderName}`}
      </label>
      <hbox class="row">
        <label class="check">
          <input type="checkbox" bind:checked={quickRule.hasText} />
          {$t`Subject or body contains`}
        </label>
        <input type="text" class="value" bind:value={quickRule.text}
          aria-label={$t`Subject or body contains`}
          on:input={() => quickRule.hasText = !!quickRule.text} />
      </hbox>
    </fieldset>
    <fieldset>
      <legend>{$t`Do the following`}</legend>
      <label class="check">
        <input type="checkbox" bind:checked={quickRule.markAsRead} />
        {$t`Mark as read`}
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={quickRule.flag} />
        {$t`Flag`}
      </label>
      <hbox class="row">
        <label class="check">
          <input type="checkbox" bind:checked={quickRule.moveToFolder} />
          {$t`Move the item to folder:`}
        </label>
        <input type="text" class="value folder" readonly value={quickRule.folder?.name ?? ""}
          aria-label={$t`Folder`} />
        <DialogButton label={$t`Select Folder…`} onClick={() => { isChoosingFolder = true; }} />
      </hbox>
    </fieldset>
    <svelte:fragment slot="footer">
      <DialogButton label={$t`OK`} primary onClick={onOK} disabled={quickRule.disabledReason ?? false} />
      <DialogButton label={$t`Cancel`} onClick={onClose} />
      <DialogButton label={$t`Advanced Options…`} onClick={onAdvanced}
        tooltip={$t`Edit all conditions and actions of this rule`} />
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
  import Dialog from "../Composer/Dialog.svelte";
  import DialogButton from "../Composer/DialogButton.svelte";
  import RulesDialog from "./RulesDialog.svelte";
  import RuleFolderDialog from "./RuleFolderDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  export let onClose: () => void;

  let quickRule = new QuickRule(message);
  let isChoosingFolder = false;
  let advancedRule: FilterRuleAction | null = null;

  function onFolderChosen(folder: Folder) {
    quickRule.folder = folder;
    quickRule.moveToFolder = true;
    isChoosingFolder = false;
  }

  async function onOK() {
    if (quickRule.disabledReason) {
      throw new UserError(quickRule.disabledReason);
    }
    await quickRule.save();
    onClose();
  }

  function onAdvanced() {
    advancedRule = quickRule.createRule();
  }
</script>

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0 0 12px 0;
    padding: 8px 12px 12px 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
  legend {
    padding: 0 4px;
    color: var(--lo-fg-secondary);
  }
  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .check.disabled {
    color: var(--lo-fg-disabled);
  }
  .row {
    align-items: center;
    gap: 8px;
  }
  .value {
    flex: 1 1 0;
    min-width: 0;
    height: 28px;
  }
  .value.folder {
    background-color: var(--lo-pane-alt-bg);
  }
</style>
