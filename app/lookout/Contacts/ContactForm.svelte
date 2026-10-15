<vbox flex class="contact-form-page" bind:this={pageEl}>
  <Ribbon>
    <RibbonTab label={$t`Contact`}>
      <RibbonGroup label={$t`Actions`}>
        <RibbonButton label={$t`Save & Close`} icon={SaveCloseIcon}
          onClick={saveAndClose} shortCutInfo="Alt+S" />
        <RibbonButton label={$t`Save & New`} icon={SaveNewIcon}
          onClick={saveAndNew} />
        <RibbonButton label={$t`Delete`} icon={DeleteIcon}
          onClick={deleteIt} />
      </RibbonGroup>
      <RibbonGroup label={$t`Communicate`}>
        <RibbonButton label={$t`Email`} icon={MailIcon}
          onClick={() => ContactActions.writeMail([person])}
          disabled={!hasEmailAddress && $t`Enter an email address first`} />
        <RibbonButton label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting([person])}
          disabled={!hasEmailAddress && $t`Enter an email address first`} />
      </RibbonGroup>
      <RibbonGroup label={$t`Options`}>
        <RibbonMenuButton label={$t`Picture`} icon={PictureIcon}>
          <MenuItem label={$t`Change Picture…`} icon={ChangePictureIcon}
            onClick={onSelectPicture} />
          <MenuItem label={$t`Remove Picture`} icon={RemovePictureIcon}
            disabled={!$person.picture}
            onClick={() => person.picture = null} />
        </RibbonMenuButton>
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>

  <FormCard title={$person.name || $t`Untitled`} kind={$t`Contact`}>
    <hbox slot="title-end" title={$t`Address book`}>
      <AddressbookChanger bind:person withLabel={true} />
    </hbox>

    <hbox flex class="form-body">
      <vbox class="column main">
        <hbox class="name-block">
          <grid class="fields">
            <label for="contact-name">{$t`Full name`}</label>
            <input id="contact-name" type="text" bind:value={person.name} bind:this={nameInput}
              placeholder={$t`First name Last name`} />
            <label for="contact-first-name">{$t`First name`}</label>
            <input id="contact-first-name" type="text" bind:value={person.firstName} />
            <label for="contact-last-name">{$t`Last name`}</label>
            <input id="contact-last-name" type="text" bind:value={person.lastName} />
            <label for="contact-company">{$t`Company`}</label>
            <input id="contact-company" type="text" bind:value={person.company} />
            <label for="contact-position">{$t`Job title`}</label>
            <input id="contact-position" type="text" bind:value={person.position} />
            <label for="contact-department">{$t`Department`}</label>
            <input id="contact-department" type="text" bind:value={person.department} />
          </grid>
          <vbox class="picture-box">
            <button class="picture" on:click={() => catchErrors(onSelectPicture)}
              title={$t`Change Picture…`}>
              <ContactPicture contact={person} size={104} />
              <hbox class="camera"><CameraIcon size={16} /></hbox>
            </button>
            <FileSelector {acceptFileTypes} bind:this={fileSelector} />
          </vbox>
        </hbox>

        <FormSection title={$t`Email`} addLabel={$t`Add email address`} onAdd={() => add(person.emailAddresses)}>
          {#each $emailAddresses.each as entry (entry)}
            <ContactEntryRow {entry} coll={emailAddresses}>
              <EmailAddressEdit bind:value={entry.value} />
            </ContactEntryRow>
          {/each}
        </FormSection>

        <FormSection title={$t`Phone numbers`} addLabel={$t`Add phone number`} onAdd={() => add(person.phoneNumbers)}>
          {#each $phoneNumbers.each as entry (entry)}
            <ContactEntryRow {entry} coll={phoneNumbers}>
              <PhoneNumberEdit bind:value={entry.value} />
            </ContactEntryRow>
          {/each}
        </FormSection>

        <FormSection title={$t`Chat`} addLabel={$t`Add chat contact`} onAdd={() => add(person.chatAccounts)}>
          {#each $chatAccounts.each as entry (entry)}
            <ContactEntryRow {entry} coll={chatAccounts} protocolLabels={chatProtocols}>
              <EmailAddressEdit bind:value={entry.value} />
            </ContactEntryRow>
          {/each}
        </FormSection>

        <FormSection title={$t`Web pages`} addLabel={$t`Add website link`} onAdd={() => add(person.urls)}>
          {#each $urls.each as entry (entry)}
            <ContactEntryRow {entry} coll={urls}>
              <URLEdit bind:value={entry.value} />
            </ContactEntryRow>
          {/each}
        </FormSection>

        <FormSection title={$t`Addresses`} addLabel={$t`Add street address`} onAdd={addStreetAddress}>
          {#each $streetAddresses.each as entry (entry)}
            <ContactEntryRow {entry} coll={streetAddresses}>
              <StreetAddressEdit bind:value={entry.value} />
            </ContactEntryRow>
          {/each}
        </FormSection>
      </vbox>

      <vbox class="column side">
        <vbox class="business-card">
          <hbox class="card-top">
            <ContactPicture contact={person} size={56} />
            <vbox class="card-text">
              <span class="card-name">{$person.name || $t`Untitled`}</span>
              {#if $person.company}<span>{$person.company}</span>{/if}
              {#if $person.position}<span>{$person.position}</span>{/if}
            </vbox>
          </hbox>
          {#if preferredPhone}<span class="card-detail">{preferredPhone}</span>{/if}
          {#if preferredEmail}<span class="card-detail link">{preferredEmail}</span>{/if}
        </vbox>
        <label for="contact-notes" class="notes-label">{$t`Notes`}</label>
        <textarea id="contact-notes" bind:value={person.notes} placeholder={$t`Personal notes`} />
      </vbox>
    </hbox>
  </FormCard>
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import { ContactEntry, type Person } from "../../logic/Abstract/Person";
  import { StreetAddress } from "../../logic/Contacts/StreetAddress";
  import { ContactActions } from "./ContactActions";
  import { PreferredEntry } from "./PreferredEntry";
  import { newPerson } from "../../frontend/Contacts/Person/Selected";
  import { catchErrors } from "../../frontend/Util/error";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../frontend/Shared/Menu/MenuItem.svelte";
  import ContactPicture from "./ContactPicture.svelte";
  import ContactEntryRow from "./ContactEntryRow.svelte";
  import FormSection from "./FormSection.svelte";
  import FormCard from "./FormCard.svelte";
  import AddressbookChanger from "../../frontend/Contacts/AddressbookChanger.svelte";
  import FileSelector from "../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import { scaleImageToDataURL } from "../../frontend/Shared/image";
  import EmailAddressEdit from "../../frontend/Contacts/PersonPage/EmailAddressEdit.svelte";
  import PhoneNumberEdit from "../../frontend/Contacts/PersonPage/PhoneNumberEdit.svelte";
  import URLEdit from "../../frontend/Contacts/PersonPage/URLEdit.svelte";
  import StreetAddressEdit from "../../frontend/Contacts/PersonPage/StreetAddressEdit.svelte";
  import SaveCloseIcon from "lucide-svelte/icons/save";
  import SaveNewIcon from "lucide-svelte/icons/file-plus-2";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import PictureIcon from "lucide-svelte/icons/circle-user-round";
  import ChangePictureIcon from "lucide-svelte/icons/image-up";
  import RemovePictureIcon from "lucide-svelte/icons/image-off";
  import CameraIcon from "lucide-svelte/icons/camera";
  import type { URLString } from "../../logic/util/util";
  import type { ArrayColl } from "svelte-collections";
  import { onMount, tick } from "svelte";
  import { t } from "../../l10n/l10n";

  export let person: Person;

  let nameInput: HTMLInputElement;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: urls = person.urls;
  $: streetAddresses = person.streetAddresses;
  $: hasEmailAddress = $emailAddresses.some(entry => !!entry.value);
  $: preferredEmail = PreferredEntry.valueOf($emailAddresses);
  $: preferredPhone = PreferredEntry.valueOf($phoneNumbers);

  onMount(async () => {
    if (ContactActions.isUnsaved(person)) {
      if (person.emailAddresses.isEmpty) {
        add(person.emailAddresses);
      }
      if (person.phoneNumbers.isEmpty) {
        add(person.phoneNumbers);
      }
    }
    await tick();
    if (!person.name) {
      nameInput?.focus();
    }
  });

  function add(coll: ArrayColl<ContactEntry>) {
    coll.push(new ContactEntry("", "work"));
  }

  function addStreetAddress() {
    person.streetAddresses.push(new ContactEntry(new StreetAddress().toString(), "work"));
  }

  async function save() {
    await person.save();
    $newPerson = null;
  }

  async function saveAndClose() {
    await save();
    ContactActions.closeForm(person);
  }

  async function saveAndNew() {
    await save();
    ContactActions.edit(ContactActions.createPerson(person.addressbook));
  }

  async function deleteIt() {
    if (await ContactActions.deleteContacts([person])) {
      ContactActions.closeForm(null);
    }
  }

  // <copied from="../../frontend/Contacts/PersonPage/SetPictureButton.svelte">
  let fileSelector: FileSelector;
  const acceptFileTypes = [ "image/*", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg" ];

  async function onSelectPicture() {
    let file = await fileSelector.selectFile();
    if (!file) {
      return;
    }
    person.picture = await scalePicture(file);
  }

  async function scalePicture(file: Blob): Promise<URLString> {
    const kPictureSize = 240; // at least 96px * 2 for HiDPI
    /** ActiveSync allows only 48 kB of base64 for a contact picture @see [MS-ASCNTC] 2.2.2.58 `Picture`
     * and the other protocols have size limits, too */
    const kMaxPictureLength = 48 * 1024;

    return await scaleImageToDataURL(file, kPictureSize, kMaxPictureLength);
  }
  // </copied>

  let pageEl: HTMLElement;
  function onKeyDown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;
    if (!pageEl?.contains(target) && target != document.body) {
      return;
    }
    if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "s") {
      event.preventDefault();
      catchErrors(save);
    } else if (event.altKey && !event.ctrlKey && !event.shiftKey && event.key.toLowerCase() == "s") {
      event.preventDefault();
      catchErrors(saveAndClose);
    }
  }

  // <copied from="../../frontend/Contacts/PersonPage/ContactBoxes.svelte">
  /** Contains the Purpose values that we want to show to the user for him to select from.
   *
   * Do *not* translate `$t` brand names.
   * The names *must* be short (<= 8 chars), otherwise the dropdown is long and
   * the address field has no space left. */
  const chatProtocols = {
    "xmpp": `XMPP`,
    "matrix": `Matrix`,
    "irc": `IRC`,
    "teams": `Teams`,
    "slack": `Slack`,
    "signal": `Signal`,
    "whatsapp": `WhatsApp`,
    "threema": `Threema`,
    "telegram": `Telegram`,
    "facebook": `Facebook`,
    "wechat": `WeChat`,
    "qq": `QQ`,
    "discord": `Discord`,
  }
  // </copied>
</script>

<style>
  .contact-form-page {
    min-height: 0;
  }
  .form-body {
    min-height: 0;
    overflow-y: auto;
    gap: 32px;
    padding: 16px 24px 24px 24px;
    align-items: start;
  }
  .column.main {
    flex: 3 1 0;
    min-width: 360px;
    max-width: 720px;
  }
  .column.side {
    flex: 2 1 0;
    min-width: 240px;
    max-width: 420px;
    align-self: stretch;
  }
  .name-block {
    gap: 24px;
    align-items: start;
  }
  grid.fields {
    flex: 1;
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 6px 12px;
  }
  label {
    color: var(--lo-fg-secondary);
  }
  .picture-box {
    position: relative;
    flex-shrink: 0;
  }
  .picture {
    position: relative;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }
  .picture:hover {
    filter: brightness(0.92);
  }
  .camera {
    position: absolute;
    right: 0;
    bottom: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--lo-border);
    border-radius: 50%;
    background-color: var(--lo-pane-bg);
    color: var(--lo-accent-text);
  }
  .form-body :global(select) {
    width: 100%;
  }
  .business-card {
    gap: 4px;
    padding: 16px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius);
    background-color: var(--lo-pane-alt-bg);
  }
  .card-top {
    gap: 12px;
    align-items: center;
    margin-block-end: 6px;
  }
  .card-text {
    min-width: 0;
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
  }
  .card-name {
    color: var(--lo-fg);
    font-size: var(--lo-font-size);
    font-weight: 600;
  }
  .card-detail {
    font-size: var(--lo-font-size-small);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-detail.link {
    color: var(--lo-accent-text);
  }
  .notes-label {
    margin-block: 20px 6px;
    font-weight: 600;
    color: var(--lo-fg);
  }
  textarea {
    flex: 1;
    min-height: 200px;
    resize: vertical;
  }
</style>
