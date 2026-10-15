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
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import CreateRuleIcon from "lucide-svelte/icons/list-plus";
  import ManageRulesIcon from "lucide-svelte/icons/list-filter";
  import { t } from "../../../l10n/l10n";

  export let message: EMail | null;
  export let account: MailAccount | null;
</script>
