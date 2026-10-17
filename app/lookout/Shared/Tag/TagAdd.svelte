<Dialog title={$t`Add New Category`} okLabel={$t`OK`} onOK={onSubmit} on:close width="380px"
  okDisabled={!name.trim() && $t`Please enter a name for the category`}>
  <FormGrid>
    <span class="lo-form-label">{$t`Name:`}</span>
    <TextField label={$t`Name:`} bind:value={name} />
    <span class="lo-form-label">{$t`Color:`}</span>
    <hbox>
      <ComboBox label={$t`Color:`} options={colorOptions} bind:value={color} width="180px" swatchColumns={5} />
    </hbox>
  </FormGrid>
</Dialog>

<script lang="ts">
  import type { Tag } from "../../../logic/Abstract/Tag";
  import { CategoryChoice } from "../../Mail/Categories/CategoryChoice";
  import { CategoryColors } from "../../Mail/Categories/CategoryColors";
  import Dialog from "../Dialog/Dialog.svelte";
  import FormGrid from "../Form/FormGrid.svelte";
  import TextField from "../Form/TextField.svelte";
  import ComboBox from "../Form/ComboBox.svelte";
  import type { ComboOption } from "../Form/ComboOption";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dispatch = createEventDispatcher<{ add: Tag }>();

  const colorOptions: ComboOption<string>[] = CategoryColors.palette
    .map(entry => ({ value: entry.color, label: entry.name, color: entry.color }));
  let name = "";
  let color = colorOptions[0].value;

  async function onSubmit() {
    dispatch("add", await CategoryChoice.addCategory(name, color));
  }
</script>
