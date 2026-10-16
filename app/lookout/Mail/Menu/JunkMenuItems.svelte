<MenuItem label={$t`Mark as Junk`} icon={JunkIcon}
  tooltip={$t`Move to the Junk folder, and train the junk filter`}
  disabled={allJunk && $t`The selected messages are already junk`}
  onClick={() => MessageActions.junk(messages, true)} />
<MenuDivider />
<MenuItem label={$t`Not Junk`} icon={NotJunkIcon} shortCutInfo="Ctrl+Alt+J"
  tooltip={$t`Move back to the Inbox, and train the junk filter`}
  disabled={!anyJunk && $t`The selected messages are not junk`}
  onClick={() => MessageActions.junk(messages, false)} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { MessageActions } from "../MessageActions";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import JunkIcon from "lucide-svelte/icons/shield-x";
  import NotJunkIcon from "lucide-svelte/icons/shield-check";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];

  $: allJunk = MessageActions.isJunk(messages);
  $: anyJunk = messages.some(message => MessageActions.isJunk([message]));
</script>
