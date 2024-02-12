<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="mail-composer-window">
  <hbox class="window-title-bar">
    {appGlobal.emailAccounts.first.emailAddress}
    <hbox flex class="spacer" />
    <RoundButton
      label="Close"
      icon={CloseIcon}
      iconSize="16px"
      on:click={onClose}
      />
  </hbox>
  <grid class="recipients">
    <hbox class="label">to</hbox>
    <hbox flex>
      <PersonsAutocomplete persons={mail.to} placeholder="Add recipients" />
      {#if !showCC}
        <hbox class="show-recipients cc" on:click={() => {showCCForce = true}}>cc</hbox>
      {/if}
      {#if !showBCC}
        <hbox class="show-recipients bcc" on:click={() => {showBCCForce = true}}>bcc</hbox>
      {/if}
    </hbox>
  {#if showCC}
    <hbox class="label">cc</hbox>
    <PersonsAutocomplete persons={mail.cc} placeholder="Add CC recipients" />
  {/if}
  {#if showBCC}
    <hbox class="label">bcc</hbox>
    <PersonsAutocomplete persons={mail.bcc} placeholder="Add BCC recipients" />
  {/if}
  </grid>
  <vbox flex>
    <textarea class="descriptionText" bind:value={mail.html} />
  </vbox>
  <hbox>
    <hbox class="label">Subject</hbox>
    <hbox class="subject" flex>
      <input type="text" bind:value={mail.subject} />
    </hbox>
    <hbox flex class="spacer" />
    <RoundButton
      label="Send"
      icon={SendIcon}
      iconSize="24px"
      filled
      disabled={!mail.subject || $to.isEmpty}
      on:click={onSend}
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import { appGlobal } from "../../../logic/app";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import CloseIcon from "lucide-svelte/icons/x";

  export let mail: EMail;

  $: to = mail.to;

  async function onSend() {
    await mail.send();
    onClose();
  }

  function onClose() {
    let me = mailMustangApp.subApps.find(app => app instanceof WriteMailMustangApp && app.mainWindowProperties.mail == mail);
    mailMustangApp.subApps.remove(me);
  }

  let showCCForce = false;
  let showBCCForce = false;
  $: showCC = showCCForce || mail.cc.hasItems;
  $: showBCC = showBCCForce || mail.bcc.hasItems;
</script>

<style>
  .mail-composer-window {
    margin: 20px;
  }
  .window-title-bar {
    margin-bottom: 32px;
  }
  .descriptionText {
    min-height: 10em;
    border: 1px solid lightgrey;
    margin-top: 32px;
  }
  grid.recipients {
    grid-template-columns: max-content 1fr;
  }
  .show-recipients {
    margin-left: 8px;
  }
  .subject input {
    width: 100%;
  }
</style>
