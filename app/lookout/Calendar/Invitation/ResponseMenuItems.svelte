<MenuItem label={$t`Send the Response Now`} icon={SendIcon} {checked}
  onClick={() => onRespond(true)} />
<MenuItem label={$t`Do Not Send a Response`} icon={NoResponseIcon}
  onClick={() => onRespond(false)} />

<script lang="ts">
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import NoResponseIcon from "lucide-svelte/icons/mail-x";
  import { t } from "../../../l10n/l10n";

  export let checked = false;
  export let onRespond: (sendReply: boolean) => Promise<void> | void;
</script>
