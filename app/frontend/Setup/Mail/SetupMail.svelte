<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <Header title="Set up existing email address" subtitle="You can use Mustang with your existing email address or you can make a new email address." />
    <MailAddress bind:emailAddress bind:this={mailAddressEl} on:continue={doFocusPassword} />
    <Password bind:password bind:this={passwordEl} on:continue={onFindConfig} />
    {#if step == 2}
      <hbox flex class="checking middle">
        <Spinner size="24px" />
        <hbox flex class="message">
          We are looking for the configuration of your email account...
        </hbox>
      </hbox>
    {:else if step == 3}
      <hbox flex class="results middle">
        <hbox flex class="message">
          <CheckIcon />
          <vbox>
            <hbox>Congratulations!</hbox>
            <hbox>We found the configuration in our ISP database.</hbox>
          </vbox>
        </hbox>
      </hbox>
    {/if}
    <hbox class="buttons">
      <Button label="Manual setup" on:click={onManualSetup} classes="secondary" />
      {#if step == 1}
        <Button label="Get new email address" on:click={onNewEmailAddress} classes="secondary" />
      {/if}
      <hbox flex />
      <Button label="Next" on:click={onFindConfig} classes="filled large" disabled={!canContinue} />
    </hbox>
    {#if step == 1}
      <Footer />
    {/if}
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import MailAddress from "./MailAddress.svelte";
  import Password from "./Password.svelte";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import Button from "../../Shared/Button.svelte";
  import BackgroundVideo from "./BackgroundVideo.svelte";
  import Spinner from "./Spinner.svelte";
  import CheckIcon from "lucide-svelte/icons/check";
  import { sleep } from "../../../logic/util/util";
  import { onMount } from "svelte";

  let emailAddress: string;
  let password: string;

  $: canContinue = step == 1 && emailAddress && password;
  let step = 1;

  async function onFindConfig() {
    step = 2;
    await sleep(3);
    step = 3;
  }
  function onManualSetup() {
    step = 30;
  }
  function onNewEmailAddress() {
    step = 40;
  }

  let passwordEl: Password;
  let mailAddressEl: MailAddress;

  function doFocusPassword() {
    passwordEl.focus();
  }

  onMount(() => {
    mailAddressEl.focus();
    onFindConfig();
  });
</script>

<style>
  .setup-mail-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: white;
  }
  .middle {
    margin-top: 24px;
    margin-bottom: 20px;
  }
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .checking .message {
    margin-left: 16px;
    background-color: #F0F9F8;
    color: #455468;
  }
  .warning .message {
    background-color: #FFFAEC;
    color: #FFC83A;
  }
  .results .message {
    padding-left: 16px;
    background-color: #E7F9EC;
    color: #0BC241;
    border: 1px solid #0BC241;
    justify-content: start;
  }
  .results .message :global(svg) {
    margin-right: 6px;
  }
  .buttons {
    align-items: end;
    justify-content: end;
    margin-top: 32px;
  }
  .buttons :global(> *) {
    margin-right: 8px;
  }
  .buttons :global(button.secondary) {
    background-color: inherit;
    padding: 3px 8px;
    font-weight: 300;
    color: #455468;
  }
  .setup-mail-window :global(input) {
    font-size: 16px;
  }
  .setup-mail-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
