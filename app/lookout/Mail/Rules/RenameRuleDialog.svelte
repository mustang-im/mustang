<Dialog title={$t`Rename`} on:close={onDone} width="400px"
  okLabel={$t`OK`}
  okDisabled={!name.trim() && $t`Please enter a name`}
  onOK={onOK}>
  <vbox class="content">
    <label for="rename-rule-name">{$t`New name of rule:`}</label>
    <input id="rename-rule-name" class="lo-text-field" type="text" bind:value={name} autofocus />
  </vbox>
</Dialog>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let rule: FilterRuleAction;
  export let onDone: () => void;

  let name = rule.name;

  async function onOK() {
    let oldName = rule.name;
    rule.name = name.trim();
    try {
      await rule.account.save();
    } catch (ex) {
      rule.name = oldName;
      throw ex;
    }
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
