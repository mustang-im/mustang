<vbox flex class="rule-editor">
  <hbox class="editor-header">
    <h2>{edit.isNew ? $t`New rule` : $t`Edit rule`}</h2>
    <hbox flex />
    <DialogButton label={$t`Save`} primary onClick={onSave} disabled={disabledReason ?? false} />
    <DialogButton label={$t`Discard`} onClick={onDiscard} />
  </hbox>
  <vbox flex class="steps">
    <hbox class="step">
      <hbox class="circle" class:done={hasName}>
        {#if hasName}<CheckIcon size={14} />{:else}1{/if}
      </hbox>
      <grid class="step-content name-grid">
        <label for="rule-name">{$t`Name`}</label>
        <input id="rule-name" type="text" bind:value={rule.name} autofocus
          placeholder={$t`Name your rule`} />
        <label for="rule-when">{$t`When`}</label>
        <select id="rule-when" bind:value={rule.when}>
          <option value={FilterMoment.IncomingBeforeSpam}>{$t`New mail arrives`}</option>
          <option value={FilterMoment.IncomingAfterSpam}>{$t`New mail arrives, after junk filtering`}</option>
          <option value={FilterMoment.Outgoing}>{$t`I send mail`}</option>
        </select>
      </grid>
    </hbox>
    <hbox class="step">
      <hbox class="circle" class:done={hasCondition}>
        {#if hasCondition}<CheckIcon size={14} />{:else}2{/if}
      </hbox>
      <vbox flex class="step-content">
        <h3>{$t`Conditions`}</h3>
        <hbox class="text-condition">
          <label for="rule-text">{$t`Subject or body contains`}</label>
          <input id="rule-text" type="text" bind:value={rule.criteria.bodyText}
            placeholder={$t`Specific words`} />
        </hbox>
        <vbox class="criteria">
          <SearchCriteria search={rule.criteria} showAccount={false} showSearchTerm={false} />
        </vbox>
      </vbox>
    </hbox>
    <hbox class="step">
      <hbox class="circle" class:done={hasAction}>
        {#if hasAction}<CheckIcon size={14} />{:else}3{/if}
      </hbox>
      <vbox flex class="step-content">
        <h3>{$t`Actions`}</h3>
        <vbox class="actions">
          <RuleActions {rule} />
        </vbox>
      </vbox>
    </hbox>
  </vbox>
</vbox>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { FilterMoment } from "../../../logic/Mail/FilterRules/FilterMoments";
  import { UserError } from "../../../logic/util/util";
  import { RuleDescription } from "./RuleDescription";
  import { RuleEdit } from "./RuleEdit";
  import DialogButton from "../Composer/DialogButton.svelte";
  import SearchCriteria from "../../../frontend/Mail/Search/SearchCriteria.svelte";
  import RuleActions from "../../../frontend/Mail/Search/RuleActions.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";

  export let edit: RuleEdit;
  export let onDone: (saved: FilterRuleAction | null) => void;

  $: rule = edit.rule;
  $: criteria = rule.criteria;
  $: addTags = rule.addTags;
  $: hasName = !!$rule.name?.trim();
  $: hasCondition = $criteria && RuleDescription.conditionLines(rule).length > 0;
  $: hasAction = $rule && $addTags && RuleDescription.hasAction(rule);
  $: disabledReason = $rule && $criteria && $addTags && edit.disabledReason;

  async function onSave() {
    if (edit.disabledReason) {
      throw new UserError(edit.disabledReason);
    }
    await edit.save();
    onDone(rule);
  }

  function onDiscard() {
    edit.discard();
    onDone(null);
  }
</script>

<style>
  .rule-editor {
    min-height: 0;
  }
  .editor-header {
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    padding-block-end: 8px;
    border-block-end: 1px solid var(--lo-divider);
  }
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .steps {
    min-height: 0;
    overflow-y: auto;
    padding: 12px 4px 4px 0;
    gap: 20px;
  }
  .step {
    align-items: start;
    gap: 16px;
  }
  .circle {
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--lo-border-strong);
    color: var(--lo-fg-secondary);
    font-weight: 600;
  }
  .circle.done {
    border-color: var(--lo-accent);
    background-color: var(--lo-accent-tint);
    color: var(--lo-accent-text);
  }
  .step-content {
    flex: 1 1 0;
    min-width: 0;
    padding-block-start: 3px;
  }
  .name-grid {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 8px 16px;
  }
  .name-grid select {
    justify-self: start;
    min-width: 280px;
  }
  h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
  }
  .text-condition {
    align-items: center;
    gap: 16px;
    margin-block-end: 8px;
  }
  .text-condition input {
    flex: 1 1 0;
    min-width: 0;
  }
</style>
