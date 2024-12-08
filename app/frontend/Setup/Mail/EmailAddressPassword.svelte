<Header title={$t`Set up existing email address`} subtitle={$t`You can use ${appName} with your existing email address or you can make a new email address.`} />
<MailAddress bind:emailAddress bind:this={mailAddressEl} on:continue={doFocusPassword} />
<Password bind:password bind:this={passwordEl} on:continue />

<script lang="ts">
  import MailAddress from "./MailAddress.svelte";
  import Password from "../Shared/Password.svelte";
  import Header from "../Shared/Header.svelte";
  import { onMount } from "svelte";
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  /** in/out */
  export let emailAddress: string;
  /** in/out */
  export let password: string;

  let passwordEl: Password;
  let mailAddressEl: MailAddress;

  function doFocusPassword() {
    passwordEl.focus();
  }

  onMount(() => {
    mailAddressEl.focus();
  });
</script>

<style>
</style>
