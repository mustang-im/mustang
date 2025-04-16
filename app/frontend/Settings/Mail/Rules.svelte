<vbox class="tags-rule-actions" flex>
  <h2>{$t`Rules *=> Criteria after which emails should be sorted`}</h2>
  <hbox class="subtitle">{$t`Perform routine actions once messages arrive`}</hbox>

  <Splitter name="settings-mail-folders" initialRightRatio={4}>
    <FastList items={rules} bind:selectedItem={rule} slot="left">
      <hbox class="header font-small" slot="header">
        {$t`Rules *=> Criteria after which emails should be sorted`}
        <!--{" (" + $rules.length + ")"}-->
        <hbox flex />
        <hbox class="buttons">
          <RoundButton
            label={$t`Add new rule`}
            icon={AddIcon}
            iconSize="10px"
            padding="3px"
            classes="small"
            onClick={onAdd}
            />
        </hbox>
      </hbox>
      <svelte:fragment slot="row" let:item={ruleRow}>
        <RulesListItem rule={ruleRow} />
      </svelte:fragment>
    </FastList>
    <vbox class="right" slot="right">
      {#if rule}
        <Scroll>
          <vbox class="rule-details">
            <HeaderGroupBox>
              <hbox slot="header">{rule.name}</hbox>
              <hbox slot="buttons-top-right" class="buttons">
                <RoundButton
                  label={$t`Delete rule`}
                  icon={DeleteIcon}
                  onClick={onDelete}
                  />
              </hbox>
              <vbox class="content">
                <grid class="name-grid">
                  <label for="name">{$t`Rule name`}</label>
                  <input type="text" bind:value={rule.name} name="name" autofocus />

                  <label for="when">{$t`When`}</label>
                  <select bind:value={rule.when}>
                    <option value={FilterMoment.IncomingBeforeSpam}>{$t`New mail arrives`}</option>
                    <option value={FilterMoment.IncomingAfterSpam}>{$t`New mail arrives, after spam filtering`}</option>
                    <option value={FilterMoment.Outgoing}>{$t`I send mail`}</option>
                  </select>
                </grid>
              </vbox>
            </HeaderGroupBox>

            <HeaderGroupBox>
              <hbox slot="header">{$t`Criteria`}</hbox>
              <vbox class="content">
                <SearchCriteria search={rule.criteria} />
              </vbox>
            </HeaderGroupBox>

            <HeaderGroupBox>
              <hbox slot="header">{$t`Action`}</hbox>
              <vbox class="content">
                <RuleActions {rule} />
              </vbox>
            </HeaderGroupBox>
          </vbox>
        </Scroll>
        <hbox class="buttons bottom">
          <Button
            icon={SaveIcon}
            label={$t`Save`}
            onClick={onSave}
          />
        </hbox>
      {/if}
    </vbox>
  </Splitter>
</vbox>

<script lang="ts">
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import { FilterMoment } from "../../../logic/Mail/FilterRules/FilterMoments";
  import SearchCriteria from "../../Mail/Search/SearchCriteria.svelte";
  import RuleActions from "../../Mail/Search/RuleActions.svelte";
  import RulesListItem from "./RulesListItem.svelte";
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SaveIcon from "lucide-svelte/icons/save";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  $: rules = account.filterRuleActions;
  /** selected rule */
  let rule: FilterRuleAction;

  $: account, defaultSelect()
  function defaultSelect() {
    rule = account.filterRuleActions.first;
  }

  function onAdd() {
    rule = new FilterRuleAction(account);
    rule.name = "-";
  }

  async function onDelete() {
    if (rule.name && !confirm($t`Do you want to delete the rule '${rule.name}'?`)) {
      return;
    }

    account.filterRuleActions.remove(rule);
    await account.save();
    rule = null;
  }

  async function onSave() {
    if (!rule.account.filterRuleActions.contains(rule)) {
      rule.account.filterRuleActions.add(rule);
    }
    await rule.account.save();
  }
</script>

<style>
  h2 {
    margin-block-start: -8px;
    margin-block-end: 8px;
  }
  .subtitle {
    margin-block-end: 24px;
    margin-inline-start: 1px;
  }
  .header {
  }
  .rule-details {
    margin-block-start: -24px;
    margin-inline-start: 24px;
    margin-inline-end: 16px;
  }
  .name-grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
  .buttons {
    justify-content: end;
    align-items: center;
  }
  .buttons.bottom {
    margin-block-start: 16px;
  }
  .buttons.bottom :global(button) {
    margin-inline-start: 8px;
  }
</style>
