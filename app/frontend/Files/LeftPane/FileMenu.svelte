<MenuItem
  onClick={deleteFile}
  label={$t`Delete file`}
  classes="danger"
  icon={DeleteIcon} />
<MenuDivider />

<script lang="ts">
  import { File } from '../../../logic/Files/File';
  import { selectedFile } from '../selected';
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let file: File;

  async function deleteFile() {
    await file.deleteIt();

    if ($selectedFile == file) {
      $selectedFile = null;
    }
  }
</script>
