<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="mail-composer-window">
  <hbox class="window-title-bar">
    <AccountDropDown bind:selectedAccount={from} />
    <hbox flex class="spacer" />
    <hbox flex class="cc buttons">
      <Button
        label="Cc"
        on:click={() => {showCCForce = !showCCForce}}
        disabled={hasCC}
        selected={showCCForce}
        plain
        />
      <Button
        label="Bcc"
        on:click={() => {showBCCForce = !showBCCForce}}
        disabled={hasBCC}
        selected={showBCCForce}
        plain
        />
    </hbox>
    <hbox class="close buttons">
      <RoundButton
        label="Discard and close"
        icon={TrashIcon}
        iconSize="16px"
        padding="6px"
        on:click={onDelete}
        />
      <RoundButton
        label="Save and close"
        icon={CloseIcon}
        iconSize="16px"
        padding="6px"
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
    <hbox class="label">Cc</hbox>
    <MailAutocomplete persons={mail.cc} placeholder="Add CC recipient" />
  {/if}
  {#if showBCC}
    <hbox class="label">Bcc</hbox>
    <MailAutocomplete persons={mail.bcc} placeholder="Add BCC recipient" />
  {/if}
  </grid>
  <HTMLEditorToolbar {editor} />
  <vbox flex class="paper">
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
      <hbox class="buttons">
        <RoundButton
          label="Send"
          icon={SendIcon}
          iconSize="20px"
          padding="6px"
          filled
          disabled={!mail.subject || $to.isEmpty}
          on:click={onSend}
          />
      </hbox>
    </hbox>
  </vbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import MailAutocomplete from "./MailAutocomplete.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Editor } from '@tiptap/core';
  import SendIcon from "lucide-svelte/icons/send";
  import TrashIcon from "lucide-svelte/icons/trash";
  import CloseIcon from "lucide-svelte/icons/x";
  import AccountDropDown from "../AccountDropDown.svelte";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;

  let from: MailAccount;

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
  $: ccList = mail.cc;
  $: bccList = mail.bcc;
  $: hasCC = $ccList.hasItems;
  $: hasBCC = $bccList.hasItems;
  $: showCC = showCCForce || hasCC;
  $: showBCC = showBCCForce || hasBCC;
</script>

<style>
  .mail-composer-window {
    padding: 12px 16px;
    background-color: #F5F5F5;
  }
  .window-title-bar .spacer {
    flex: 3 0 0;
  }
  .window-title-bar .cc.buttons > :global(*){
    margin-left: 16px;
  }
  .window-title-bar .cc.buttons > :global(button.selected) {
    background-color: rgb(0, 0, 0, 5%);
  }
  .window-title-bar .close.buttons > :global(*){
    margin-left: 8px;
  }
  grid.recipients {
    grid-template-columns: max-content 1fr;
    margin-top: 4px;
    margin-bottom: 12px;
    /* background-color: #FFFFFF55; */
  }
  .recipients .label {
    color: #B3B3B3;
  }
  .label {
    align-items: top;
    margin-top: 4px;
    margin-right: 2px;
    margin-left: 2px;
    min-width: 1.7em;
  }
  .paper {
    background-color: white;
    border-radius: 5px;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
    margin-top: 4px;
  }
  .editor {
    margin: 12px 12px;
  }
  .footer {
    margin-top: 8px;
    margin-bottom: 6px;
  }
  .footer .label {
    margin: 0px 12px;
    align-items: center;
  }
  .subject input {
    width: 100%;
  }
  .footer .buttons {
    margin: 0px 8px;
  }
</style>
