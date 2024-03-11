<FileDropTarget on:add-files={onFilesDrop} on:inline-files={onFileInlineDrop} allowInline={true}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <vbox flex class="mail-composer-window">
    <hbox class="window-title-bar">
      <AccountDropDown bind:selectedAccount={from} />
      <hbox flex class="spacer" />
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
        <hbox flex>
          <MailAutocomplete persons={mail.to} placeholder="Add recipient" />
        </hbox>
        <hbox class="cc buttons">
          <Button
            label="Cc"
            on:click={() => {showCCForce = !showCCForce}}
            disabled={hasCC}
            selected={showCC}
            />
          <Button
            label="Bcc"
            on:click={() => {showBCCForce = !showBCCForce}}
            disabled={hasBCC}
            selected={showBCC}
            />
        </hbox>
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
    <HTMLEditorToolbar {editor}>
      <Button
        label="Attachments"
        icon={AttachmentIcon}
        iconOnly
        on:click={onAddAttachment}
        slot="end"
        />
    </HTMLEditorToolbar>
    <hbox flex class="editor-and-attachments">
      <vbox flex class="editor-wrapper">
        <vbox flex class="paper">
          <Scroll>
            <vbox flex class="editor">
              <HTMLEditor bind:html={mail.html} bind:editor on:send={onSend} sendKey='Ctrl-Enter'/>
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
      {#if showAttachments}
        <vbox class="attachments">
          <AttachmentsPane attachments={mail.attachments} />
        </vbox>
      {/if}
    </hbox>
  </vbox>
</FileDropTarget>

<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import { insertImage } from "../../Shared/Editor/InsertImage";
  import MailAutocomplete from "./MailAutocomplete.svelte";
  import AttachmentsPane from "./Attachments/AttachmentsPane.svelte";
  import FileSelector from "./Attachments/FileSelector.svelte";
  import FileDropTarget from "./Attachments/FileDropTarget.svelte";
  import AccountDropDown from "../AccountDropDown.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Editor } from '@tiptap/core';
  import SendIcon from "lucide-svelte/icons/send";
  import TrashIcon from "lucide-svelte/icons/trash";
  import CloseIcon from "lucide-svelte/icons/x";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;

  let from: MailAccount;
  let fileSelector: FileSelector;
  async function onAddAttachment() {
    let file = await fileSelector.selectFile();
    if (!file) {
      console.log("no file selected");
      return;
    }
    console.log("selected file", file);
    mail.attachments.add(file);
  }

  function onFilesDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    mail.attachments.addAll(files);
  }

  function onFileInlineDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    for (let file of files) {
      insertImage(editor, file);
    }
  }

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
  let showAttachmentsForce = false;
  $: ccList = mail.cc;
  $: bccList = mail.bcc;
  $: attachmentsList = mail.attachments;
  $: hasCC = $ccList.hasItems;
  $: hasBCC = $bccList.hasItems;
  $: hasAttachments = $attachmentsList.hasItems;
  $: showCC = showCCForce || hasCC;
  $: showBCC = showBCCForce || hasBCC;
  $: showAttachments = showAttachmentsForce || hasAttachments;
</script>

<style>
  .mail-composer-window {
    padding: 8px 16px;
    background-color: #FCFCFC;
  }
  .cc.buttons {
    border-bottom: 1px solid rgb(0, 0, 0, 7%);
  }
  .cc.buttons > :global(button){
    border: none;
  }
  .cc.buttons > :global(button:not(.selected)){
    background-color: inherit;
  }
  .cc.buttons > :global(button.selected) {
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
  .label {
    color: #B3B3B3;
  }
  .recipients .label {
    align-items: top;
    margin-top: 3px;
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
  .editor-wrapper {
    flex: 3 0 0;
  }
  .attachments {
    min-width: 120px;
    max-width: 350px;
    margin-right: -12px;
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
