<FileDropTarget
  on:add-files={(event) => catchErrors(() => onFilesDrop(event))}
  on:inline-files={(event) => catchErrors(() => onFileInlineDrop(event))}
  allowInline={true}>
  <vbox flex class="mail-composer-window">
    <hbox class="window-title-bar">
      <IdentitySelector bind:selectedIdentity={fromIdentity}
        bind:fromAddress={mail.from.emailAddress}
        bind:fromName={mail.from.name} />
      <hbox flex class="spacer" />
      <hbox class="close buttons">
        <Button
          label={$t`Discard`}
          icon={TrashIcon}
          iconSize="15px" iconOnly
          onClick={onDelete}
          />
        <Button
          label={$t`Save`}
          icon={CloseIcon}
          iconSize="15px" iconOnly
          onClick={onSave}
          />
        <RoundButton
          classes="send"
          label={sendDisabledTooltip ?? $t`Send`}
          icon={SendIcon}
          iconSize="20px"
          padding="6px"
          filled
          disabled={!mail.subject || $to.isEmpty}
          onClick={onSend}
          tabindex={2}
          />
        <!--
        <Button
          label={$t`Send`}
          tooltip={sendDisabledTooltip ?? $t`Send`}
          icon={SendIcon}
          iconSize="18px"
          onClick={onSend}
          classes="filled"
          disabled={!mail.subject || $to.isEmpty}
          />
        -->
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
          <MailAutocomplete addresses={mail.to} placeholder={$t`Add recipient`} tabindex={1} autofocus={mail.to.isEmpty}>
            <svelte:fragment slot="person-popup-buttons" let:person>
              <Button plain label={$t`CC`} onClick={() => onMoveToCC(person)} />
              <Button plain label={$t`BCC`} onClick={() => onMoveToBCC(person)} />
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
        <svelte:fragment slot="person-popup-buttons" let:person={person}>
          <Button plain label={$t`To`} onClick={() => onMoveToTo(person)} />
          <Button plain label={$t`BCC`} onClick={() => onMoveToBCC(person)} />
        </svelte:fragment>
      </MailAutocomplete>
    {/if}
    {#if showBCC}
      <hbox class="label">{$t`Bcc`}</hbox>
      <MailAutocomplete addresses={mail.bcc} placeholder={$t`Add BCC recipient`} tabindex={1}>
        <svelte:fragment slot="person-popup-buttons" let:person>
          <Button plain label={$t`To`} onClick={() => onMoveToTo(person)} />
          <Button plain label={$t`CC`} onClick={() => onMoveToCC(person)} />
        </svelte:fragment>
      </MailAutocomplete>
    {/if}
    </grid>
    <HTMLEditorToolbar {editor}>
      <Button
        label={$t`Spell check`}
        icon={SpellCheckIcon}
        iconOnly
        onClick={() => spellcheckEnabled.value = !spellcheckEnabled.value}
        selected={$spellcheckEnabled.value}
        slot="before-undo"
        />
      <Button
        label={$t`Attachments`}
        icon={AttachmentIcon}
        iconOnly
        onClick={onAddAttachment}
        slot="end"
        />
    </HTMLEditorToolbar>
    {#if loading}
      <Spinner size="64px" />
    {/if}
    <hbox flex class="editor-and-attachments">
      <vbox flex class="editor-wrapper">
        <Paper>
          <Scroll>
            <hbox class="subject">
              <input type="text" bind:value={mail.subject} tabindex={1} placeholder={$t`Subject`} class="font-normal" />
            </hbox>
            <vbox flex class="editor" spellcheck={$spellcheckEnabled.value}>
              <!-- The html in the mail passed in MUST already be sanitized HTML.
              Using `rawHTMLDangerous` avoids that we're sanitizing on every keypress. -->
              <HTMLEditor bind:html={mail.rawHTMLDangerous} bind:editor tabindex={1} />
            </vbox>
          </Scroll>
        </Paper>
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
  import { Attachment } from "../../../logic/Abstract/Attachment";
  import { insertImage } from "../../Shared/Editor/InsertImage";
  import { MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { WriteMailMustangApp, mailMustangApp } from "../MailMustangApp";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { appGlobal } from "../../../logic/app";
  import { UserError, assert } from "../../../logic/util/util";
  import { backgroundError, catchErrors, showUserError } from "../../Util/error";
  import MailAutocomplete from "./MailAutocomplete.svelte";
  import AttachmentsPane from "./Attachments/AttachmentsPane.svelte";
  import FileSelector from "./Attachments/FileSelector.svelte";
  import FileDropTarget from "./Attachments/FileDropTarget.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import IdentitySelector from "./IdentitySelector.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import Spinner from "../../Shared/Spinner.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Button from "../../Shared/Button.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Editor } from '@tiptap/core';
  import SendIcon from "lucide-svelte/icons/send";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/save";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";
  import SpellCheckIcon from "lucide-svelte/icons/square-check-big";
  import { tick } from "svelte";
  import { t, gt } from "../../../l10n/l10n";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;
  let fromIdentity: MailIdentity;
  let spellcheckEnabled = getLocalStorage("mail.send.spellcheck.enabled", false);

  // HACK to reload the HTMLEditor to force it to load the new text
  // See <https://github.com/ueberdosis/tiptap/issues/4918>
  let lastMail = null;
  $: differentMailLoaded(mail);
  function differentMailLoaded(_dummy: any) {
    if (closing) {
      return;
    }
    if (mail == lastMail || !mail) {
      return;
    }
    lastMail = mail;

    fromIdentity = mail.identity
      ?? mail.folder?.account.identities.first
      ?? appGlobal.emailAccounts.first?.identities.first;
    assert(fromIdentity, "Composer: Need identity or account for email");
    // setAuthor() called

    if (mail.from?.emailAddress) {
      let recipients = [mail.from, ...mail.to.contents, ...mail.cc.contents, ...mail.bcc.contents];
      checkInvalidRecipients(recipients);
    }

    loadText()
      .catch(backgroundError);
  }

  let loading = false;
  async function loadText() {
    if (!mail.hasHTML) {
      return;
    }
    loading = true;
    await mail.loadBody();
    loading = false;
    if (!editor) {
      await tick();
    }
    editor.commands.setContent(mail.html);
    setCursorDefault();
  }

  function setCursorDefault() {
    if (mail.to.isEmpty && !mail.rawHTMLDangerous) {
      return;
    }
    let quoteSetting = getLocalStorage("mail.send.quote", "below").value;
    let below = quoteSetting == "below";
    editor.commands.focus(below ? 'start' : 'end');
  }

  $: fromIdentity && setAuthor()
  function setAuthor() {
    mail.identity = fromIdentity;
    mail.folder ??= fromIdentity.account.getSpecialFolder(SpecialFolder.Sent)
      ?? fromIdentity.account.inbox;
    if (fromIdentity == mail.identity) {
      return; // don't overwrite concrete email address for catch-all identity
    }
    mail.from = fromIdentity.asPersonUID();
  }

  function checkInvalidRecipients(recipients: PersonUID[]) {
    const kNoReplyRegExp = /no[\-_t]*reply@|invalid$/;
    let invalidTo = recipients.find(person =>
      !person.emailAddress || kNoReplyRegExp.test(person.emailAddress));
    if (invalidTo) {
      let notification = showUserError(new UserError(gt`The recipient ${invalidTo.emailAddress} does not accept email`));
      doOnClose.push(() => notification.remove());
    }
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

  async function onFileInlineDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    for (let file of files) {
      await insertImage(editor, file, mail.attachments);
    }
  }

  $: sendDisabledTooltip =
    !mail.subject ? $t`Please enter a subject` :
    $to.isEmpty ? $t`Please add some recipients` : null;

  async function onSend() {
    mail.text = null;
    await mail.compose.send();
    onClose();
  }

  async function onSave() {
    await mail.compose.saveAsDraft();
    onClose();
  }
  async function onDelete() {
    onClose();
    await mail.compose.deleteDrafts();
  }

  let closing = false;
  let doOnClose: (() => void)[] = [];
  function onClose() {
    closing = true;
    for (let func of doOnClose) {
      func();
    }
    doOnClose = [];

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
    padding: 8px 16px 0px 16px;
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
  .close.buttons > :global(*){
    margin-inline-start: 8px;
  }
  .close.buttons :global(svg) {
    stroke-width: 1.5px;
  }
  .close.buttons :global(button) {
    border: 1px solid var(--border);
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
  .editor {
    margin: 12px 12px;
    max-width: 50em;
  }
  .editor-wrapper {
    flex: 3 0 0;
    margin-block-start: 4px;
  }
  .attachments {
    width: 300px;
    margin-inline-end: -12px;
  }
  .subject {
    margin-block-start: 16px;
    margin-block-end: 8px;
    margin-inline-start: 18px;
    margin-inline-end: 24px;
  }
  .subject input {
    width: 100%;
  }
  .buttons :global(.send.disabled) {
    opacity: 30%;
  }
</style>
