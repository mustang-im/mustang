{#if item.picker == RulePicker.Person}
  <RuleAddressDialog person={rule.criteria.includesPerson}
    onOK={person => apply(() => rule.criteria.includesPerson = person)}
    on:close={onClose} />
{:else if item.picker == RulePicker.Words}
  <SearchTextDialog text={rule.criteria.bodyText}
    onOK={text => apply(() => rule.criteria.bodyText = text)}
    on:close={onClose} />
{:else if item.picker == RulePicker.Category}
  <ColorCategoriesDialog isChooseMode chosen={item.isAction ? rule.addTags : rule.criteria.tags}
    onChosen={tags => apply(() => (item.isAction ? rule.addTags : rule.criteria.tags).replaceAll(tags))}
    on:close={onClose} />
{:else if item.picker == RulePicker.Size}
  <MessageSizeDialog sizeMin={rule.criteria.sizeMin} sizeMax={rule.criteria.sizeMax}
    onOK={(sizeMin, sizeMax) => apply(() => {
      rule.criteria.sizeMin = sizeMin;
      rule.criteria.sizeMax = sizeMax;
    })}
    on:close={onClose} />
{:else if item.picker == RulePicker.Date}
  <ReceivedDateDialog sentDateMin={rule.criteria.sentDateMin} sentDateMax={rule.criteria.sentDateMax}
    onOK={(sentDateMin, sentDateMax) => apply(() => {
      rule.criteria.sentDateMin = sentDateMin;
      rule.criteria.sentDateMax = sentDateMax;
    })}
    on:close={onClose} />
{:else if item.picker == RulePicker.Folder}
  <RuleFolderDialog account={rule.account}
    folder={item.isAction ? rule.toFolder : rule.criteria.folder}
    onChosen={folder => apply(() => setFolder(folder))}
    on:close={onClose} />
{/if}

<script lang="ts">
  import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { RulePicker, type RuleItem } from "./RuleItems";
  import RuleAddressDialog from "./RuleAddressDialog.svelte";
  import SearchTextDialog from "./SearchTextDialog.svelte";
  import ColorCategoriesDialog from "../../Shared/Tag/ColorCategoriesDialog.svelte";
  import MessageSizeDialog from "./MessageSizeDialog.svelte";
  import ReceivedDateDialog from "./ReceivedDateDialog.svelte";
  import RuleFolderDialog from "./RuleFolderDialog.svelte";

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
