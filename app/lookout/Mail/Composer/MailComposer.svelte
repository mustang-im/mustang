<vbox flex class="composer-page" on:keydown|capture={onKeyDown}>
  <ComposerRibbon {mail} {editor} identity={fromIdentity}
    canEncrypt={!!privateKey}
    canShowFrom={hasSeveralIdentities}
    bccLocked={hasBCC}
    bind:showFrom={$showFromSetting.value}
    bind:showBcc={$showBccSetting.value}
    bind:showEmojis
    bind:spellcheck={$spellcheckEnabled.value}
    onAddressBook={() => openSelectNames(RecipientField.To)}
    onAttachFile={onAddAttachment}
    onInsertPicture={onInsertPicture}
    onInsertLink={() => showLinkDialog = true}
    onSignatures={() => showSignatures = true}
    onCheckNames={onCheckNames}
    onDateTime={() => openTool(ComposerTool.DateTime)}
    onMoreSymbols={() => openTool(ComposerTool.Symbol)}
    onWordCount={() => openTool(ComposerTool.WordCount)}
    onFind={replace => openTool(replace ? ComposerTool.Replace : ComposerTool.Find)}
    />
  <vbox flex class="composer lo-card">
    <FileDropTarget
      on:add-files={(event) => catchErrors(() => onFilesDrop(event))}
      on:inline-files={(event) => catchErrors(() => onFileInlineDrop(event))}
      allowInline={true}>
      <hbox class="title-row">
        <h1>{$mail.subject || $t`Untitled`}<span class="kind">– {$sendFormat.value == "html" ? $t`Message (HTML)` : $t`Message (Plain Text)`}</span></h1>
        <hbox flex />
        <hbox class="title-buttons">
          <button class="quick-access" title={$t`Undo (Ctrl+Z)`} aria-label={$t`Undo`}
            disabled={!editor?.can().undo()}
            on:click={() => editor.chain().focus().undo().run()}>
            <UndoIcon size={16} />
          </button>
          <button class="quick-access" title={$t`Redo (Ctrl+Y)`} aria-label={$t`Redo`}
            disabled={!editor?.can().redo()}
            on:click={() => editor.chain().focus().redo().run()}>
            <RedoIcon size={16} />
          </button>
          <DialogButton label={$t`Save`} icon={SaveIcon} classes="plain"
            tooltip={$t`Save as draft (Ctrl+S)`}
            disabled={saveDisabledReason ?? false}
            onClick={onSave} />
          <DialogButton label={$t`Discard`} icon={DiscardIcon} classes="plain"
            onClick={onDiscard} />
          <button class="close" title={$t`Close`} aria-label={$t`Close`} on:click={onCloseRequest}>
            <CloseIcon size={18} />
          </button>
        </hbox>
      </hbox>
      <hbox class="header">
        <button class="send" on:click={() => catchErrors(onSendRequest)}
          class:disabled={!!sendDisabledTooltip}
          title={sendDisabledTooltip ?? $t`Send (Ctrl+Enter)`}
          tabindex={2}>
          <SendIcon size={24} strokeWidth={1.5} />
          <span>{$t`Send`}</span>
        </button>
        <grid class="fields">
          {#if showFromRow}
            <FromField bind:selectedIdentity={fromIdentity}
              bind:fromAddress={mail.from.emailAddress}
              bind:fromName={mail.from.name} />
          {/if}
          <button class="field-button" on:click={() => openSelectNames(RecipientField.To)} tabindex={-1}
            title={$t`Select recipients from the address book`}>
            {$t`To`}
          </button>
          <hbox class="field">
            <AddressField recipients={mail.to} label={$t`To`} chips={isChips} tabindex={1}
              autofocus={mail.to.isEmpty} onAdd={onRecipientAdded} bind:this={toField} />
          </hbox>
          <button class="field-button" on:click={() => openSelectNames(RecipientField.Cc)} tabindex={-1}
            title={$t`Select recipients from the address book`}>
            {$t`Cc`}
          </button>
          <hbox class="field">
            <AddressField recipients={mail.cc} label={$t`Cc`} chips={isChips} tabindex={1}
              onAdd={onRecipientAdded} bind:this={ccField} />
          </hbox>
          {#if showBCC}
            <button class="field-button" on:click={() => openSelectNames(RecipientField.Bcc)} tabindex={-1}
              title={$t`Select recipients from the address book`}>
              {$t`Bcc`}
            </button>
            <hbox class="field">
              <AddressField recipients={mail.bcc} label={$t`Bcc`} chips={isChips} tabindex={1}
                onAdd={onRecipientAdded} bind:this={bccField} />
            </hbox>
          {/if}
          <label class="subject-label" for="composer-subject">{$t`Subject`}</label>
          <hbox class="field subject">
            <input id="composer-subject" type="text" bind:value={mail.subject} tabindex={1} />
          </hbox>
        </grid>
      </hbox>
      {#if $mail.shouldEncrypt || $mail.signedByKeyID}
        <hbox class="info-bar">
          {#if $mail.shouldEncrypt}
            <LockIcon size={16} />
            {$t`This message will be encrypted and digitally signed.`}
          {:else}
            <SignIcon size={16} />
            {$t`This message will be digitally signed.`}
          {/if}
        </hbox>
      {/if}
      <EncryptionInfoBar {mail} identity={fromIdentity} bind:encryptionError />
      {#if hasAttachments}
        <hbox class="attachments">
          <AttachmentList attachments={mail.attachments} isComposing />
        </hbox>
      {/if}
      <hbox flex class="body">
        <vbox flex class="editor-scroll">
          {#if loading}
            <hbox class="loading"><Spinner size="32px" /></hbox>
          {/if}
          <SMLComposer {mail} />
          <vbox flex class="editor" spellcheck={$spellcheckEnabled.value}>
            <!-- The html in the mail passed in MUST already be sanitized HTML.
            Using `rawHTMLDangerous` avoids that we're sanitizing on every keypress. -->
            <HTMLEditor bind:html={mail.rawHTMLDangerous} bind:editor tabindex={1} />
          </vbox>
        </vbox>
        {#if showEmojis}
          <vbox class="emojis">
            <GraphicSelector
              on:select={onEmoji}
              on:backspace={() => catchErrors(onEmojiBackspace)}
              bind:isOpen={showEmojis}
              />
          </vbox>
        {/if}
      </hbox>
    </FileDropTarget>
  </vbox>
</vbox>

{#if selectNames}
  <SelectNamesDialog fields={selectNames.fields} defaultField={selectNames.field(selectNamesField)}
    onOK={onSelectNamesOK} onCancel={() => selectNames = null} />
{/if}
{#if showSaveChanges}
  <SaveChangesDialog
    yesDisabled={saveDisabledReason}
    onYes={onSaveAndClose}
    onNo={onDiscard}
    onCancel={() => showSaveChanges = false} />
{/if}
{#if showLinkDialog && editor}
  <LinkDialog {editor} onDone={() => showLinkDialog = false} />
{/if}
{#if showSignatures}
  <SignaturesDialog identity={fromIdentity} onDone={() => showSignatures = false} />
{/if}
{#if editor && openedTool == ComposerTool.DateTime}
  <DateTimeDialog {editor} onDone={closeTool} />
{:else if editor && openedTool == ComposerTool.Symbol}
  <SymbolDialog {editor} onDone={closeTool} />
{:else if editor && openedTool == ComposerTool.WordCount}
  <WordCountDialog {editor} onDone={closeTool} />
{:else if editor && (openedTool == ComposerTool.Find || openedTool == ComposerTool.Replace)}
  <FindReplaceDialog {editor} replaceMode={openedTool == ComposerTool.Replace} onDone={closeTool} />
{/if}
<FileSelector bind:this={fileSelector} />
<FileSelector bind:this={imageSelector} acceptFileTypes={["image/png", "image/jpeg", "image/gif"]} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { addFilesAsAttachments } from "../../../logic/Abstract/Attachment";
  import { findAllIdentities, type MailIdentity } from "../../../logic/Mail/MailIdentity";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import { appGlobal } from "../../../logic/app";
  import { UserError, assert } from "../../../logic/util/util";
  import { insertImage } from "../../../frontend/Shared/Editor/InsertImage";
  import { WriteMailMustangApp, mailMustangApp } from "../../../frontend/Mail/MailMustangApp";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import type { RibbonLayout } from "../../Shared/Ribbon/Ribbon";
  import { goBack } from "../../../frontend/AppsBar/selectedApp";
  import { backgroundError, catchErrors, showError, showUserError } from "../../../frontend/Util/error";
  import { ComposerShortcuts, ComposerCommand } from "./ComposerShortcuts";
  import { ComposerEncryption } from "./ComposerEncryption";
  import { DraftContent } from "./DraftContent";
  import { RecipientField, SelectNames } from "./SelectNames";
  import ComposerRibbon from "./ComposerRibbon.svelte";
  import SelectNamesDialog from "./SelectNamesDialog.svelte";
  import SaveChangesDialog from "./SaveChangesDialog.svelte";
  import LinkDialog from "./LinkDialog.svelte";
  import SignaturesDialog from "./SignaturesDialog.svelte";
  import DateTimeDialog from "./DateTimeDialog.svelte";
  import SymbolDialog from "./SymbolDialog.svelte";
  import WordCountDialog from "./WordCountDialog.svelte";
  import FindReplaceDialog from "./FindReplaceDialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import AddressField from "./AddressField.svelte";
  import FromField from "./FromField.svelte";
  import EncryptionInfoBar from "./EncryptionInfoBar.svelte";
  import SMLComposer from "../../../frontend/Mail/Composer/SMLComposer.svelte";
  import AttachmentList from "../Attachments/AttachmentList.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import FileDropTarget from "../../../frontend/Mail/Composer/Attachments/FileDropTarget.svelte";
  import HTMLEditor from "../../../frontend/Shared/Editor/HTMLEditor.svelte";
  import GraphicSelector from "../../../frontend/Chat/Emoji/GraphicSelector.svelte";
  import Spinner from "../../../frontend/Shared/Spinner.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import SaveIcon from "lucide-svelte/icons/save";
  import DiscardIcon from "lucide-svelte/icons/trash-2";
  import CloseIcon from "lucide-svelte/icons/x";
  import UndoIcon from "lucide-svelte/icons/undo-2";
  import RedoIcon from "lucide-svelte/icons/redo-2";
  import LockIcon from "lucide-svelte/icons/lock";
  import SignIcon from "lucide-svelte/icons/signature";
  import { t, gt } from "../../../l10n/l10n";
  import { tick } from "svelte";
  import type { Editor } from "@tiptap/core";

  export let mail: EMail;

  let editor: Editor;
  $: to = mail.to;
  let fromIdentity: MailIdentity;
  let identities = findAllIdentities();
  $: hasSeveralIdentities = $identities.length > 1 || !!fromIdentity?.isCatchAll;
  let spellcheckEnabled = getLocalStorage("mail.send.spellcheck.enabled", false);
  let showFromSetting = getLocalStorage("lookout.mail.compose.showFrom", true);
  let sendFormat = getLocalStorage("mail.send.format", "html");
  let showBccSetting = getLocalStorage("lookout.mail.compose.showBcc", false);
  let encryptionError: string | null = null;
  let showEmojis = false;
  let selectNames: SelectNames | null = null;
  let selectNamesField = RecipientField.To;
  let showSaveChanges = false;
  let showLinkDialog = false;
  let showSignatures = false;
  enum ComposerTool {
    DateTime = "date-time",
    Symbol = "symbol",
    WordCount = "word-count",
    Find = "find",
    Replace = "replace",
  }
  let openedTool: ComposerTool | null = null;
  let ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  $: isChips = $ribbonLayout.value == "simplified";
  let toField: AddressField;
  let ccField: AddressField;
  let bccField: AddressField;

  // <copied from="../../../frontend/Mail/Composer/MailComposer.svelte">
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
    if (mail.to.isEmpty) {
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

  function onRecipientAdded(recipient: PersonUID) {
    // <copied from="../../../frontend/Mail/Composer/MailAutocomplete.svelte" onAddPerson()>
    // Get the certificate now, so that we can show whether we can encrypt
    recipient.findPerson()?.fetchEncryptionKeys()
      .catch(showError);
    // </copied>
  }

  let fileSelector: FileSelector;
  async function onAddAttachment() {
    let files = await fileSelector.selectFiles();
    if (!files?.length) {
      return;
    }
    addFilesAsAttachments(mail, files);
  }

  function onFilesDrop(event: CustomEvent) {
    addFilesAsAttachments(mail, event.detail.files as File[]);
  }

  async function onFileInlineDrop(event: CustomEvent) {
    let files = event.detail.files as File[];
    for (let file of files) {
      await insertImage(editor, file, mail);
    }
  }

  function onEmoji(ev: CustomEvent) {
    let emoji = ev.detail.emoji;
    if (emoji) {
      editor.commands.insertContent(emoji);
    }
  }

  function onEmojiBackspace() {
    editor.view.focus();
    document.execCommand("delete");
  }

  $: sendDisabledTooltip =
    !mail.subject ? $t`Please enter a subject` :
    $to.isEmpty ? $t`Please add some recipients` :
    encryptionError ??
    null;

  async function onSend() {
    try {
      await mail.compose.send(onClose);
    } catch (ex) {
      if (closing) { // Already closed. Re-open, to not lose the mail.
        mailMustangApp.writeMail(mail);
      }
      throw ex;
    }
  }

  let closing = false;
  let doOnClose: (() => void)[] = [];
  function onClose() {
    closing = true;
    for (let func of doOnClose) {
      func();
    }
    doOnClose = [];

    let me = mailMustangApp.subApps.find(app => app instanceof WriteMailMustangApp && app.windowParams.mail == mail);
    mailMustangApp.subApps.remove(me);
    goBack();
  }

  $: bccList = mail.bcc;
  $: attachmentsList = mail.attachments;
  $: hasBCC = $bccList.hasItems;
  $: hasAttachments = $attachmentsList.hasItems;
  // </copied>
  $: showBCC = $showBccSetting.value || hasBCC;
  $: showFromRow = $showFromSetting.value && hasSeveralIdentities;

  $: privateKey = ComposerEncryption.privateKey(fromIdentity);
  $: privateKey, fromIdentity && catchErrors(() => ComposerEncryption.applyIdentityDefaults(mail, privateKey));

  $: saveDisabledReason = $mail.shouldEncrypt ? $t`Encrypted drafts are not supported yet` : null;

  async function onSendRequest() {
    if (sendDisabledTooltip) {
      throw new UserError(sendDisabledTooltip);
    }
    await onSend();
  }

  async function onSave() {
    if (saveDisabledReason) {
      throw new UserError(saveDisabledReason);
    }
    await mail.compose.saveAsDraft();
  }

  async function onSaveAndClose() {
    await onSave();
    showSaveChanges = false;
    onClose();
  }

  async function onDiscard() {
    // <copied from="../../../frontend/Mail/Composer/CloseButton.svelte" onDelete()>
    onClose();
    await mail.compose.deleteDrafts();
    // </copied>
  }

  function onCloseRequest() {
    if (DraftContent.hasUserText(mail.html)) {
      showSaveChanges = true;
    } else {
      onClose();
    }
  }

  function openSelectNames(field: RecipientField) {
    selectNamesField = field;
    selectNames = new SelectNames(mail);
  }

  function onSelectNamesOK() {
    selectNames.apply(mail);
    selectNames = null;
  }

  let imageSelector: FileSelector;
  async function onInsertPicture() {
    let files = await imageSelector.selectFiles();
    for (let file of files ?? []) {
      await insertImage(editor, file, mail);
    }
  }

  function openTool(tool: ComposerTool) {
    openedTool = tool;
  }

  function closeTool() {
    openedTool = null;
  }

  async function onCheckNames() {
    let fields = [toField, ccField, bccField].filter(field => !!field);
    let errors: Error[] = [];
    for (let field of fields) {
      try {
        await field.checkNames();
      } catch (ex) {
        errors.push(ex);
      }
    }
    if (errors.length) {
      throw errors[0];
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    let command = ComposerShortcuts.commandFor(event);
    if (!command || selectNames || showSaveChanges || showLinkDialog || showSignatures || openedTool) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (command == ComposerCommand.Send) {
      catchErrors(onSendRequest);
    } else if (command == ComposerCommand.Save) {
      onSave().catch(showError);
    } else if (command == ComposerCommand.Link && editor) {
      showLinkDialog = true;
    } else if (command == ComposerCommand.Find && editor) {
      openTool(ComposerTool.Find);
    } else if (command == ComposerCommand.Replace && editor) {
      openTool(ComposerTool.Replace);
    }
  }
</script>

<style>
  .composer-page {
    min-height: 0;
  }
  .composer {
    min-height: 0;
    margin: 0 8px 8px 8px;
    overflow: hidden;
  }
  .composer :global(.container),
  .composer :global(.container > .content) {
    min-height: 0;
  }
  .title-row {
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    padding: 10px 12px 6px 24px;
  }
  h1 {
    margin: 0;
    font-size: var(--lo-font-size-large);
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  h1 .kind {
    margin-inline-start: 8px;
    font-weight: normal;
    color: var(--lo-fg-secondary);
  }
  .title-buttons {
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
  }
  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
  }
  .close:hover {
    background-color: var(--lo-danger);
    color: var(--lo-danger-fg);
  }
  .quick-access {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
  }
  .quick-access:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
  }
  .quick-access:disabled {
    color: var(--lo-fg-disabled);
  }
  .header {
    flex-shrink: 0;
    align-items: start;
    gap: 12px;
    padding: 8px 24px 12px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .send {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    width: 64px;
    height: 76px;
    margin-block-start: 2px;
    border: none;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-accent);
    color: var(--lo-accent-fg);
    font-size: var(--lo-font-size);
  }
  .send:hover {
    background-color: var(--lo-accent-hover);
  }
  .send:active {
    background-color: var(--lo-accent-pressed);
  }
  .send.disabled {
    opacity: 0.55;
  }
  .fields {
    flex: 1 1 0;
    min-width: 0;
    grid-template-columns: 80px 1fr;
    align-items: center;
    column-gap: 12px;
    row-gap: 6px;
  }
  .fields :global(.field-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font-size: var(--lo-font-size);
  }
  .fields :global(.field-button:hover) {
    background-color: var(--lo-hover-bg);
    border-color: var(--lo-border-strong);
  }
  .field {
    min-width: 0;
    min-height: 32px;
    align-items: center;
    border-block-end: 1px solid var(--lo-input-border);
  }
  .field:focus-within {
    border-block-end-color: var(--lo-accent);
    box-shadow: 0 1px 0 0 var(--lo-accent);
  }
  .field > :global(*) {
    flex: 1 1 0;
    min-width: 0;
  }
  .field input {
    border: none;
    outline: none;
    background-color: transparent;
    color: var(--lo-fg);
  }
  .subject-label {
    justify-self: center;
    color: var(--lo-fg-secondary);
  }
  .subject input {
    height: 30px;
    padding: 0 2px;
    font: inherit;
  }
  .info-bar {
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    margin: 8px 24px 0 24px;
    padding: 6px 12px;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-accent-tint);
    color: var(--lo-fg);
    font-size: var(--lo-font-size-small);
  }
  .info-bar :global(svg) {
    color: var(--lo-accent-text);
  }
  .attachments {
    flex-shrink: 0;
    padding: 10px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .body {
    min-height: 0;
  }
  .editor-scroll {
    min-height: 0;
    overflow-y: auto;
    padding: 16px 24px;
  }
  .editor {
    min-height: 200px;
    font-size: 15px;
    line-height: 1.5;
  }
  .editor :global(.ProseMirror) {
    min-height: 200px;
  }
  .editor :global(.html-editor blockquote) {
    border-left-color: var(--lo-accent);
  }
  .loading {
    justify-content: center;
    padding: 16px;
  }
  .emojis {
    width: 360px;
    min-height: 0;
    border-inline-start: 1px solid var(--lo-divider);
  }
</style>
