<MenuItem label={senderName ? $t`Always Move Messages From: ${senderName}` : $t`Always Move Messages From…`}
  icon={AlwaysMoveIcon}
  disabled={(!message && $t`Select a message first`) ||
    (!message.from?.findPerson() && $t`The sender is not in your address book`)}
  onClick={() => MailDialogs.open({ kind: "always-move-from", message })} />
<MenuItem label={$t`Create Rule…`} icon={CreateRuleIcon}
  disabled={!message && $t`Select a message first`}
  onClick={() => MessageActions.createRule(message)} />
<MenuItem label={$t`Manage Rules & Alerts…`} icon={ManageRulesIcon}
  disabled={!account && $t`Select a folder of an account first`}
  onClick={() => MessageActions.openRules(account)} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { MessageActions } from "../MessageActions";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import AlwaysMoveIcon from "lucide-svelte/icons/folder-input";
  import CreateRuleIcon from "lucide-svelte/icons/list-plus";
  import ManageRulesIcon from "lucide-svelte/icons/list-filter";
  import { t } from "../../../l10n/l10n";

  export let message: EMail | null;
  export let account: MailAccount | null;

  $: senderName = message?.from?.name || message?.from?.emailAddress || "";
</script>
