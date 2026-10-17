<hbox class="account-row">
  <hbox class="icon"><svelte:component this={icon} size={20} /></hbox>
  <vbox flex class="names">
    <span class="name">{$account.name}</span>
    <span class="type">{AccountLabels.fullTypeLabel($account)}</span>
  </vbox>
  <DialogButton label={$t`Manage`} onClick={() => onManage(account)} />
</hbox>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import { AccountLabels } from "../Shared/AccountLabels";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: Account;
  export let icon: ConstructorOfATypedSvelteComponent;
  export let onManage: (account: Account) => void;
</script>

<style>
  .account-row {
    align-items: center;
    gap: 12px;
    padding-block: 8px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .icon {
    color: var(--lo-accent-text);
  }
  .names {
    min-width: 0;
  }
  .name {
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .type {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
</style>
