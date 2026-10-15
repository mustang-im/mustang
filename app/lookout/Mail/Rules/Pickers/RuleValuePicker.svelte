{#if item.picker == RulePicker.Person}
  <RuleAddressDialog person={rule.criteria.includesPerson}
    onOK={person => apply(() => rule.criteria.includesPerson = person)}
    onClose={onClose} />
{:else if item.picker == RulePicker.Words}
  <SearchTextDialog text={rule.criteria.bodyText}
    onOK={text => apply(() => rule.criteria.bodyText = text)}
    onClose={onClose} />
{:else if item.picker == RulePicker.Category}
  <CategoryChooserDialog selected={item.isAction ? rule.addTags : rule.criteria.tags}
    onOK={tags => apply(() => (item.isAction ? rule.addTags : rule.criteria.tags).replaceAll(tags))}
    onClose={onClose} />
{:else if item.picker == RulePicker.Size}
  <MessageSizeDialog sizeMin={rule.criteria.sizeMin} sizeMax={rule.criteria.sizeMax}
    onOK={(sizeMin, sizeMax) => apply(() => {
      rule.criteria.sizeMin = sizeMin;
      rule.criteria.sizeMax = sizeMax;
    })}
    onClose={onClose} />
{:else if item.picker == RulePicker.Date}
  <ReceivedDateDialog sentDateMin={rule.criteria.sentDateMin} sentDateMax={rule.criteria.sentDateMax}
    onOK={(sentDateMin, sentDateMax) => apply(() => {
      rule.criteria.sentDateMin = sentDateMin;
      rule.criteria.sentDateMax = sentDateMax;
    })}
    onClose={onClose} />
{:else if item.picker == RulePicker.Folder}
  <RuleFolderDialog account={rule.account}
    folder={item.isAction ? rule.toFolder : rule.criteria.folder}
    onChosen={folder => apply(() => setFolder(folder))}
    onCancel={onClose} />
{/if}

<script lang="ts">
  import type { FilterRuleAction } from "../../../../logic/Mail/FilterRules/FilterRuleAction";
  import type { Folder } from "../../../../logic/Mail/Folder";
  import { RulePicker, type RuleItem } from "../RuleItems";
  import RuleAddressDialog from "./RuleAddressDialog.svelte";
  import SearchTextDialog from "./SearchTextDialog.svelte";
  import CategoryChooserDialog from "./CategoryChooserDialog.svelte";
  import MessageSizeDialog from "./MessageSizeDialog.svelte";
  import ReceivedDateDialog from "./ReceivedDateDialog.svelte";
  import RuleFolderDialog from "../RuleFolderDialog.svelte";

  export let rule: FilterRuleAction;
  export let item: RuleItem;
  export let onDone: (changed: boolean) => void;

  let changed = false;

  function apply(write: () => void) {
    write();
    changed = true;
  }

  function setFolder(folder: Folder) {
    if (!item.isAction) {
      rule.criteria.folder = folder;
      return;
    }
    rule.toFolder = folder;
    rule.copy = item.id == "copy" ? true : null;
  }

  function onClose() {
    onDone(changed);
  }
</script>
