<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="mail-composer-window">
  <hbox class="window-title-bar">
    {appGlobal.emailAccounts.first.emailAddress}
    <hbox flex class="spacer" />
    <hbox class="secondary-buttons">
      {#if !showCC}
        <hbox class="show-recipients cc" on:click={() => {showCCForce = true}}>CC</hbox>
      {/if}
      {#if !showBCC}
        <hbox class="show-recipients bcc" on:click={() => {showBCCForce = true}}>BCC</hbox>
      {/if}
    </hbox>
    <hbox class="close-buttons">
      <RoundButton
        label="Discard and close"
        icon={TrashIcon}
        iconSize="16px"
        on:click={onDelete}
        />
      <RoundButton
        label="Save and close"
        icon={CloseIcon}
        iconSize="16px"
        on:click={onSave}
        />
    </hbox>
</hbox>
  <grid class="recipients">
    <hbox>
      {#if showCC || showBCC}
        <hbox class="label">
            To
        </hbox>
        {/if}
      </hbox>
      <hbox flex>
      <MailAutocomplete persons={mail.to} placeholder="Add recipient" />
    </hbox>
  {#if showCC}
    <hbox class="label">CC</hbox>
    <MailAutocomplete persons={mail.cc} placeholder="Add CC recipient" />
  {/if}
  {#if showBCC}
    <hbox class="label">BCC</hbox>
    <MailAutocomplete persons={mail.bcc} placeholder="Add BCC recipient" />
  {/if}
  </grid>
  <HTMLEditorToolbar {editor} />
  <Scroll>
    <vbox flex class="editor">
      <HTMLEditor bind:html={mail.html} bind:editor />
    </vbox>
  </Scroll>
  <hbox class="footer">
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
  import HTMLEditor from "./HTMLEditor.svelte";
  import HTMLEditorToolbar from "./HTMLEditorToolbar.svelte";
  import MailAutocomplete from "./MailAutocomplete.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import type { Editor } from '@tiptap/core';
  import SendIcon from "lucide-svelte/icons/send";
  import TrashIcon from "lucide-svelte/icons/trash";
  import CloseIcon from "lucide-svelte/icons/x";
  import Scroll from "../../Shared/Scroll.svelte";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;

  async function onSend() {
    await mail.send();
    onClose();
  }

  function onSave() {
    onClose();
  }
  function onDelete() {
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
    padding: 12px 16px;
    background-color: #F5F5F5;
  }
  .window-title-bar .secondary-buttons {
    margin: 0px 16px;
  }
  .window-title-bar .secondary-buttons > :global(*){
    margin-left: 16px;
  }
  .window-title-bar .close-buttons > :global(*){
    margin-left: 8px;
  }
  grid.recipients {
    grid-template-columns: max-content 1fr;
    margin-bottom: 16px;
    /* background-color: #FFFFFF55; */
  }
  .label {
    align-items: top;
    margin-top: 4px;
    margin-right: 2px;
    margin-left: 2px;
    min-width: 1.7em;
  }
  .show-recipients {
    align-items: center;
    margin-left: 8px;
  }
  .editor {
    background-color: white;
    padding: 8px 12px;
  }
  .footer {
    margin-top: 8px;
  }
  .subject input {
    width: 100%;
  }
</style>
