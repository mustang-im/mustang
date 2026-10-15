<Dialog title={$t`Copy rules to`} okLabel={$t`OK`} onOK={onOK} on:close={onClose} width="460px"
  okDisabled={RuleListActions.cannotCopyTo(rule, target)}>
  <hbox class="copy-row">
    <label for="copy-rules-folder">{$t`Folder:`}</label>
    <select id="copy-rules-folder" class="lo-text-field" bind:value={target}>
      {#each $accounts.each as account}
        <option value={account} disabled={!!RuleListActions.cannotCopyTo(rule, account)}
          title={RuleListActions.cannotCopyTo(rule, account) || null}>
          {RuleDescription.inboxLabel(account)}
        </option>
      {/each}
    </select>
  </hbox>
</Dialog>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { appGlobal } from "../../../logic/app";
  import { RuleListActions } from "./RuleListActions";
  import { RuleDescription } from "./RuleDescription";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let rule: FilterRuleAction;
  export let onCopy: (account: MailAccount) => void;
  export let onClose: () => void;

  const accounts = appGlobal.emailAccounts;
  let target: MailAccount = rule.account;

  function onOK() {
    onCopy(target);
  }
</script>

<style>
  .copy-row {
    align-items: center;
    gap: 12px;
    padding-block: 4px;
  }
  select {
    flex: 1 1 0;
    min-width: 0;
  }
</style>
