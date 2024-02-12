<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="mail-composer-window">
  <hbox class="window-title-bar">
    {appGlobal.emailAccounts.first.emailAddress}
    <hbox class="spacer" />
    <Button compact color="gray" on:click={onClose}>X</Button>
  </hbox>
  <hbox class="recipients">
    <hbox class="label">to</hbox>
    <PersonsAutocomplete persons={mail.to} placeholder="Add recipients" />
  </hbox>
  <vbox flex>
    <textarea class="descriptionText" bind:value={mail._bodyPlaintext} />
  </vbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/Message";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import PersonsAutocomplete from "../../Shared/PersonAutocomplete/PersonsAutocomplete.svelte";
  import { Button } from "@svelteuidev/core";
  import { appGlobal } from "../../../logic/app";

  export let mail: EMail;

  function onClose() {
    let me = mailMustangApp.subApps.find(app => app instanceof WriteMailMustangApp && app.mainWindowProperties.mail == mail);
    mailMustangApp.subApps.remove(me);
  }
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
</style>
