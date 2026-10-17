<Dialog title={$t`Group By`} okLabel={$t`OK`} onOK={save} width="440px" on:close>
  <vbox class="group-by">
    <CheckBox label={$t`Automatically group according to arrangement`} bind:checked={isAutomatic} />
    <GroupBox label={$t`Group items by`} disabled={isAutomatic}>
      <hbox class="field-row">
        <ComboBox label={$t`Group items by`} options={fieldOptions} bind:value={field}
          disabled={isAutomatic} width="100%" />
        <vbox class="order">
          <Radio label={$t`Ascending`} bind:group={isAscending} value={true} disabled={isAutomatic || !field} />
          <Radio label={$t`Descending`} bind:group={isAscending} value={false} disabled={isAutomatic || !field} />
        </vbox>
      </hbox>
    </GroupBox>
  </vbox>
</Dialog>

<script lang="ts">
  import { ArrangeFields, type ViewSettings } from "./ViewSettings";
  import { ArrangeBy, MessageGrouping } from "../3pane/MessageGrouping";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import GroupBox from "../../Shared/Form/GroupBox.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import Radio from "../../Shared/Form/Radio.svelte";
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import { createEventDispatcher } from "svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let settings: ViewSettings;
  const dispatch = createEventDispatcher<{ change: Partial<ViewSettings> }>();

  const fieldOptions: ComboOption<ArrangeBy | null>[] = [
    { value: null, label: gt`(none)` },
    ...ArrangeFields.all().map(option => ({ value: option.id, label: option.label })),
  ];
  let isAutomatic = !settings.groupBy && settings.showInGroups;
  let field: ArrangeBy | null = settings.showInGroups ? settings.groupBy ?? settings.arrangeBy : null;
  let isAscending = MessageGrouping.isDescendingByDefault(field ?? ArrangeBy.Date) == !!(settings.groupBy ? settings.groupReverse : settings.reverseSort);

  function save() {
    if (isAutomatic) {
      dispatch("change", { groupBy: null, groupReverse: false, showInGroups: true });
    } else if (!field) {
      dispatch("change", { groupBy: null, groupReverse: false, showInGroups: false });
    } else {
      dispatch("change", {
        groupBy: field,
        groupReverse: MessageGrouping.isDescendingByDefault(field) == isAscending,
        showInGroups: true,
      });
    }
  }
</script>

<style>
  .group-by {
    gap: 12px;
  }
  .field-row {
    align-items: center;
    gap: 16px;
  }
  .field-row > :global(.lo-combobox) {
    flex: 1 1 auto;
  }
  .order {
    flex: 0 0 auto;
  }
</style>
