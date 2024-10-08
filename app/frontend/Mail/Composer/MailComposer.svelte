<FileDropTarget on:add-files={onFilesDrop} on:inline-files={onFileInlineDrop} allowInline={true}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <vbox flex class="mail-composer-window">
    <hbox class="window-title-bar">
      <IdentitySelector bind:selectedIdentity={fromIdentity} chooseFromPersons={recipients} />
      <hbox flex class="spacer" />
      <hbox class="close buttons">
        <RoundButton
          label={$t`Discard and close`}
          icon={TrashIcon}
          iconSize="16px"
          padding="6px"
          onClick={onDelete}
          />
        <RoundButton
          label={$t`Save and close`}
          icon={CloseIcon}
          iconSize="16px"
          padding="6px"
          onClick={onSave}
          />
      </hbox>
    </hbox>
    <grid class="recipients">
      <hbox>
        {#if showCC || showBCC}
          <hbox class="label">
              {$t`To`}
          </hbox>
        {/if}
      </hbox>
      <hbox flex>
        <hbox flex>
          <MailAutocomplete addresses={mail.to} placeholder={$t`Add recipient`} tabindex={1} autofocus={true}>
            <svelte:fragment slot="person-popup-buttons" let:personUID>
              <Button plain label={$t`CC`} onClick={() => onMoveToCC(personUID)} />
              <Button plain label={$t`BCC`} onClick={() => onMoveToBCC(personUID)} />
            </svelte:fragment>
          </MailAutocomplete>
        </hbox>
        <hbox class="cc buttons">
          <Button
            label={$t`Cc`}
            on:click={() => {showCCForce = !showCCForce}}
            disabled={hasCC}
            selected={showCC}
            />
          <Button
            label={$t`Bcc`}
            on:click={() => {showBCCForce = !showBCCForce}}
            disabled={hasBCC}
            selected={showBCC}
            />
        </hbox>
      </hbox>
    {#if showCC}
      <hbox class="label">{$t`Cc`}</hbox>
      <MailAutocomplete addresses={mail.cc} placeholder={$t`Add CC recipient`} tabindex={1}>
        <svelte:fragment slot="person-popup-buttons" let:personUID>
          <Button plain label={$t`To`} onClick={() => onMoveToTo(personUID)} />
          <Button plain label={$t`BCC`} onClick={() => onMoveToBCC(personUID)} />
        </svelte:fragment>
      </MailAutocomplete>
    {/if}
    {#if showBCC}
      <hbox class="label">{$t`Bcc`}</hbox>
      <MailAutocomplete addresses={mail.bcc} placeholder={$t`Add BCC recipient`} tabindex={1}>
        <svelte:fragment slot="person-popup-buttons" let:personUID>
          <Button plain label={$t`To`} onClick={() => onMoveToTo(personUID)} />
          <Button plain label={$t`CC`} onClick={() => onMoveToCC(personUID)} />
        </svelte:fragment>
      </MailAutocomplete>
    {/if}
    </grid>
    <HTMLEditorToolbar {editor}>
      <Button
        label={$t`Attachments`}
        icon={AttachmentIcon}
        iconOnly
        onClick={onAddAttachment}
        slot="end"
        />
    </HTMLEditorToolbar>
    <hbox flex class="editor-and-attachments">
      <vbox flex class="editor-wrapper">
        <vbox flex class="paper">
          <Scroll>
            <vbox flex class="editor">
              <!-- The html in the mail passed in MUST already be sanitized HTML.
              Using `rawHTMLDangerous` avoids that we're sanitizing on every keypress. -->
              <HTMLEditor bind:html={mail.rawHTMLDangerous} bind:editor tabindex={1} />
            </vbox>
          </Scroll>
          <hbox class="footer">
            <hbox class="label">{$t`Subject`}</hbox>
            <hbox class="subject" flex>
              <input type="text" bind:value={mail.subject} tabindex={1} />
            </hbox>
            <hbox class="buttons">
              <RoundButton
                label={$t`Send`}
                icon={SendIcon}
                iconSize="20px"
                padding="6px"
                filled
                disabled={!mail.subject || $to.isEmpty}
                onClick={onSend}
                tabindex={1}
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
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { Attachment } from "../../../logic/Mail/Attachment";
  import { insertImage } from "../../Shared/Editor/InsertImage";
  import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import MailAutocomplete from "./MailAutocomplete.svelte";
  import AttachmentsPane from "./Attachments/AttachmentsPane.svelte";
  import FileSelector from "./Attachments/FileSelector.svelte";
  import FileDropTarget from "./Attachments/FileDropTarget.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import IdentitySelector from "./IdentitySelector.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Editor } from '@tiptap/core';
  import SendIcon from "lucide-svelte/icons/send";
  import TrashIcon from "lucide-svelte/icons/trash";
  import CloseIcon from "lucide-svelte/icons/x";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import { appName, appVersion } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;
  let fromIdentity: MailIdentity;
  let recipients: PersonUID[] = [];

  // HACK to reload the HTMLEditor to force it to load the new text
  // See <https://github.com/ueberdosis/tiptap/issues/4918>
  let lastMail = mail;
  $: differentMailLoaded(mail);
  function differentMailLoaded(_dummy: any) {
    if (mail.from?.emailAddress) {
      recipients = [mail.from, ...mail.to.contents, ...mail.cc.contents, ...mail.bcc.contents];
    }
    if (mail == lastMail || !mail) {
      return;
    }
    lastMail = mail;
    if (editor) {
      editor.commands.setContent(mail.html);
    }
  }

  $: fromIdentity && setFromHeader()
  function setFromHeader() {
    mail.from = new PersonUID(fromIdentity.emailAddress, fromIdentity.userRealname);
    mail.folder = fromIdentity.account.getSpecialFolder(SpecialFolder.Sent)
      ?? fromIdentity.account.inbox;
  }

  function onMoveToCC(person: PersonUID) {
    mail.bcc.remove(person);
    mail.to.remove(person);
    mail.cc.add(person);
  }
  function onMoveToBCC(person: PersonUID) {
    mail.cc.remove(person);
    mail.to.remove(person);
    mail.bcc.add(person);
  }
  function onMoveToTo(person: PersonUID) {
    mail.cc.remove(person);
    mail.bcc.remove(person);
    mail.to.add(person);
  }

  let fileSelector: FileSelector;
  async function onAddAttachment() {
    let file = await fileSelector.selectFile();
    if (!file) {
      console.log("no file selected");
      return;
    }
    console.log("Selected attachment file", file);
    mail.attachments.add(Attachment.fromFile(file));
  }

  function onFilesDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    mail.attachments.addAll(files.map(file => Attachment.fromFile(file)));
  }

  function onFileInlineDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    for (let file of files) {
      insertImage(editor, file);
    }
  }

  async function onSend() {
    mail.text = null;

    if (fromIdentity.replyTo) {
      mail.replyTo = new PersonUID(fromIdentity.replyTo, fromIdentity.userRealname);
    }
    let sig = fromIdentity.signatureHTML;
    if (sig) {
      mail.html += `<footer class="signature">${sig}</footer>`;
    }
    mail.headers.set("User-Agent", (appName == "Mustang" ? "" : `Mustang/${appVersion} `) + `${appName}/${appVersion}`);

    await mail.send();
    onClose();
  }

  async function onSave() {
    mail.text = null;
    // TODO upload to Drafts folder, and delete old draft
    onClose();
  }
  async function onDelete() {
    await mail.deleteMessage();
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
    background-color: var(--leftpane-bg);
    color: var(--leftpane-fg);
  }
  .cc.buttons {
    align-items: start;
    border-bottom: 1px solid rgb(0, 0, 0, 7%);
    margin-block-start: 4px;
  }
  .cc.buttons > :global(button){
    border: none;
    margin-inline-start: 4px;
  }
  .cc.buttons > :global(button:not(.selected)){
    background-color: inherit;
    color: inherit;
  }
  .cc.buttons > :global(button.selected) {
    background-color: rgb(0, 0, 0, 5%);
  }
  .window-title-bar .close.buttons > :global(*){
    margin-inline-start: 8px;
  }
  grid.recipients {
    grid-template-columns: max-content 1fr;
    margin-block-start: 4px;
    margin-block-end: 12px;
    /* background-color: #FFFFFF55; */
  }
  .label {
    color: #B3B3B3;
  }
  .recipients .label {
    align-items: top;
    margin-block-start: 3px;
    margin-inline-end: 2px;
    margin-inline-start: 2px;
    min-width: 1.7em;
  }
  .paper {
    background-color: var(--main-bg);
    color: var(--main-fg);
    border-radius: 5px;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
    margin-block-start: 4px;
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
    margin-inline-end: -12px;
  }
  .footer {
    margin-block-start: 8px;
    margin-block-end: 6px;
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
