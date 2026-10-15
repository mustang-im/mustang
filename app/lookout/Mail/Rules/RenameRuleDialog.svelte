<Dialog title={$t`Rename`} on:close={onCancel} width="400px">
  <vbox class="content">
    <label for="rename-rule-name">{$t`New name of rule:`}</label>
    <input id="rename-rule-name" type="text" bind:value={name} autofocus
      on:keydown={event => event.key == "Enter" && onOK()} />
  </vbox>
  <svelte:fragment slot="footer">
    <DialogButton label={$t`OK`} primary onClick={onOK} disabled={!name.trim() && $t`Please enter a name`} />
    <DialogButton label={$t`Cancel`} onClick={onCancel} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import { showError } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";

  export let rule: FilterRuleAction;
  export let onDone: () => void;

  let name = rule.name;

  async function onOK() {
    name = name.trim();
    if (!name) {
      return;
    }
    let oldName = rule.name;
    rule.name = name;
    try {
      await rule.account.save();
    } catch (ex) {
      rule.name = oldName;
      showError(ex);
      return;
    }
    onDone();
  }

  function onCancel() {
    onDone();
  }
</script>

<style>
  .content {
    gap: 6px;
    padding-block: 4px;
  }
  label {
    color: var(--lo-fg-secondary);
  }
</style>
