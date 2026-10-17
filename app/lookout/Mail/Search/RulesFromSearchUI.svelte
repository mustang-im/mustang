<RulesWizard {model} onFinish={onFinish} onCancel={onClose} />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { RuleWizardModel } from "../Rules/RuleWizardModel";
  import RulesWizard from "../Rules/RulesWizard.svelte";
  import { createEventDispatcher } from "svelte";

  export let search: SearchEMail;
  export let account: MailAccount;

  const dispatch = createEventDispatcher<{ close: void }>();
  const criteria = new SearchEMail();
  criteria.copyFrom(search);
  const model = RuleWizardModel.forRule(new FilterRuleAction(account, criteria), true);

  async function onFinish(rule: FilterRuleAction) {
    // <copied from="../../../frontend/Mail/Search/RulesFromSearchUI.svelte">
    rule.account.filterRuleActions.add(rule);
    await rule.account.save();
    // </copied>
    onClose();
  }

  function onClose() {
    dispatch("close");
  }
</script>
