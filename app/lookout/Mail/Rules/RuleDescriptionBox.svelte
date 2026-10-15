<vbox class="rule-description" class:empty={!rule}>
  {#if rule}
    {#each lines as line, i}
      <div class="line" class:first={i == 0}>
        {#each RuleDescription.parts(line) as part}
          {#if part.isValue}
            <button class="value" on:click={onEdit} title={$t`Edit the rule`}>{part.text}</button>
          {:else}
            {part.text}
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { RuleDescription } from "./RuleDescription";
  import { t } from "../../../l10n/l10n";

  export let rule: FilterRuleAction | null;
  export let onEdit: () => void;

  $: criteria = rule?.criteria;
  $: addTags = rule?.addTags;
  $: lines = rule && $rule && $criteria && $addTags ? RuleDescription.lines(rule) : [];
</script>

<style>
  .rule-description {
    min-height: 88px;
    max-height: 120px;
    overflow-y: auto;
    padding: 6px 10px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    line-height: 1.5;
  }
  .rule-description.empty {
    background-color: var(--lo-pane-alt-bg);
  }
  .line {
    padding-inline-start: 16px;
  }
  .line.first {
    padding-inline-start: 0;
  }
  .value {
    display: inline;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  .value:hover {
    color: var(--lo-accent-hover);
  }
</style>
