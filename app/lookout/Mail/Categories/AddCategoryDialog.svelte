<Dialog title={$t`Add New Category`} okLabel={$t`OK`} onOK={onSubmit} on:close={onClose} width="380px"
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
  import { CategoryChoice } from "./CategoryChoice";
  import { CategoryColors } from "./CategoryColors";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import type { ComboOption } from "../../Shared/Form/ComboOption";
  import { t } from "../../../l10n/l10n";

  export let onAdded: (tag: Tag) => void;
  export let onClose: () => void;

  const colorOptions: ComboOption<string>[] = CategoryColors.palette
    .map(entry => ({ value: entry.color, label: entry.name, color: entry.color }));
  let name = "";
  let color = colorOptions[0].value;

  async function onSubmit() {
    onAdded(await CategoryChoice.addCategory(name, color));
  }
</script>
