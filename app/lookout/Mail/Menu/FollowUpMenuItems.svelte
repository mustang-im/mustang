<MenuItem label={$t`No Date`} icon={FlagIcon} shortCutInfo="Insert"
  tooltip={$t`Flag the message for follow up`}
  checked={allFlagged}
  onClick={() => MessageActions.flag(messages, true)} />
<MenuDivider />
<MenuItem label={$t`Clear Flag`} icon={ClearFlagIcon}
  disabled={!anyFlagged && $t`The selected messages are not flagged`}
  onClick={() => MessageActions.flag(messages, false)} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MessageActions } from "../MessageActions";
  import { SelectionState } from "../SelectionState";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import FlagIcon from "lucide-svelte/icons/flag";
  import ClearFlagIcon from "lucide-svelte/icons/flag-off";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];

  $: allFlagged = SelectionState.allFlagged(messages);
  $: anyFlagged = messages.some(message => message.isStarred);
</script>
