<hbox class="cell name" class:broken={isBroken} on:dblclick={onEdit}>
  <span class="text">{$rule.name}</span>
  {#if $rule.when == FilterMoment.Outgoing}
    <span class="suffix lo-secondary">{$t`(outgoing)`}</span>
  {/if}
  {#if isBroken}
    <span class="suffix" title={$t`The target folder does not exist anymore`}>{$t`(Error)`}</span>
  {/if}
</hbox>
<hbox class="cell actions" on:dblclick={onEdit}>
  <RuleActionIcons {rule} />
</hbox>

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { FilterMoment } from "../../../logic/Mail/FilterRules/FilterMoments";
  import { RuleDescription } from "./RuleDescription";
  import RuleActionIcons from "./RuleActionIcons.svelte";
  import { t } from "../../../l10n/l10n";

  export let rule: FilterRuleAction;
  export let onEdit: () => void;

  $: isBroken = $rule && RuleDescription.isBroken(rule);
</script>

<style>
  .cell {
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 8px !important;
    white-space: nowrap;
    cursor: default;
  }
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .suffix {
    flex-shrink: 0;
  }
  .broken {
    color: var(--lo-danger);
  }
</style>
