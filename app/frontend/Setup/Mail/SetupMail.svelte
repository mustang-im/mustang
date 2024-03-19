<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <Header title="Set up existing email address" subtitle="You can use Mustang with your existing email address or you can make a new email address." />
    <MailAddress bind:emailAddress />
    <Password bind:password />
    {#if step > 1}
      Checking....
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

  let emailAddress: string;
  let password: string;

  $: canContinue = step == 1 && emailAddress && password;
  let step = 1;

  function onFindConfig() {
    step = 2;
  }
  function onManualSetup() {
    step = 2;
  }
  function onNewEmailAddress() {
    step = 2;
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
