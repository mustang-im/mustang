<MenuItem
  onClick={deleteMessage}
  classes="danger"
  label={$t`Delete`}
  icon={TrashIcon} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;

  async function deleteMessage() {
    await message.deleteMessage();
  }
</script>
