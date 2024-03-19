<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <Header title="Set up existing email address" subtitle="You can use Mustang with your existing email address or you can make a new email address." />
    <MailAddress bind:emailAddress />
    <Password bind:password />
    {#if step == 2}
      <hbox flex class="checking">
        <Spinner size="24px" />
        <hbox flex class="message">
          We are looking for the configuration of your email account...
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

  let emailAddress: string;
  let password: string;

  $: canContinue = step == 1 && emailAddress && password;
  let step = 2;

  function onFindConfig() {
    step = 2;
  }
  function onManualSetup() {
    step = 3;
  }
  function onNewEmailAddress() {
    step = 4;
  }
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
  .checking {
    margin-top: 32px;
    margin-bottom: 20px;
  }
  .checking .message {
    background-color: #F0F9F8;
    color: #455468;
    margin-left: 12px;
    padding: 4px 16px;
    border-radius: 100px;
  }
  .warning {
    background-color: #FFFAEC;
    color: #FFC83A;
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
