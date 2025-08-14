<vbox class="add-dialog">
  <AccountDropDown bind:selectedAccount showAllOption={$t`Isolated container`} accounts={appGlobal.emailAccounts} filterByWorkspace={false} />
  {#if selectedAccount}
    <!---->
  {:else}
    <hbox class="email">
      <input type="email" bind:value={emailAddress} placeholder={$t`App login`} autofocus />
    </hbox>
    <input type="password" bind:value={password} placeholder={$t`App password`} />
  {/if}
  <hbox class="last-row">
    <hbox flex />
    <RoundButton
      icon={SaveIcon}
      label={$t`Save`}
      onClick={save}
      classes="save create"
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import type { Account } from "../../../logic/Abstract/Account";
  import { appGlobal } from "../../../logic/app";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SaveIcon from "lucide-svelte/icons/check";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ added: WebAppListed }>();

  export let app: WebAppListed;

  let selectedAccount: Account | null = null;
  let emailAddress: string;
  let password: string;

  function save() {
    let instance = app.instantiate(selectedAccount);
    appGlobal.webApps.myApps.add(instance);
    dispatchEvent("added", instance);
  }
</script>

<style>
  .add-dialog {
    border: 1px solid var(--border);
    border-radius: 3px;
    margin: -6px 4px 4px 4px;
    padding: 12px;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .add-dialog input {
    background-color: transparent;
  }
  .last-row {
    margin-block-start: 8px;
  }
</style>
