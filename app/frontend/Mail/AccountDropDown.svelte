<hbox class="account-dropdown">
  <hbox class="selected-label">{selectedAccount.name}
  </hbox>
  <Button plain icon={ChevronDownIcon} iconSize="16px" iconOnly />
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../logic/Mail/MailAccount";
  import { appGlobal } from "../../logic/app";
  import Button from "../Shared/Button.svelte";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";

  /** in/out */
  export let selectedAccount: MailAccount = appGlobal.emailAccounts.first;
</script>

<style>
    .account-dropdown {
    font-size: 14px;
    font-weight: 200;
    align-items: center;
  }
  .account-dropdown,
  .account-dropdown :global(button .icon) {
    color: grey;
  }
</style>
