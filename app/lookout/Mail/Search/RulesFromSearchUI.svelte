<RulesWizard {model} onFinish={onFinish} on:close={onClose} />

<script lang="ts" context="module">
  import { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { writable } from "svelte/store";

  export const openRulesFromSearch = writable<SearchEMail | null>(null);
</script>

<script lang="ts">
  import { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
  import { MailSearch } from "./MailSearch";
  import { RuleWizardModel } from "../Rules/RuleWizardModel";
  import RulesWizard from "../Rules/RulesWizard.svelte";
  import { createEventDispatcher } from "svelte";

  export let search: SearchEMail;

  const dispatch = createEventDispatcher<{ close: void }>();
  const account = search.account ??
    (MailSearch.isRealFolder($selectedFolder) ? $selectedFolder.account : MailSearch.isRealAccount($selectedAccount) ? $selectedAccount : null);
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
