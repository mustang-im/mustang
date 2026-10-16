<vbox flex class="contact-card">
  <hbox class="header">
    <ContactPicture contact={person} size={72} />
    <vbox class="title">
      <h1 class="name">{$person.name || $t`(No name)`}</h1>
      {#if jobLine}
        <hbox class="job">{jobLine}</hbox>
      {/if}
      {#if $person.company}
        <hbox class="company">{$person.company}</hbox>
      {/if}
      <hbox class="actions">
        <CardButton label={$t`Email`} icon={MailIcon}
          onClick={() => ContactActions.writeMail([person])}
          disabled={$emailAddresses.isEmpty && $t`This contact has no email address`} />
        <CardButton label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting([person])}
          disabled={$emailAddresses.isEmpty && $t`This contact has no email address`} />
        {#if preferredPhone}
          <CardButton label={$t`Call`} icon={CallIcon} href="tel:{preferredPhone}" />
        {/if}
        <CardButton label={$t`Edit`} icon={EditIcon}
          onClick={() => ContactActions.edit(person)} />
      </hbox>
    </vbox>
  </hbox>

  <vbox flex class="sections">
    {#if hasContactInfo}
      <section>
        <h2>{$t`Contact information`}</h2>
        <grid class="fields">
          {#each $emailAddresses.each as entry}
            <CardField icon={MailIcon} label={entryLabel(entry, $t`Email`)} copyValue={entry.value}>
              <a class="link" href="mailto:{entry.value}">{entry.value}</a>
            </CardField>
          {/each}
          {#each $phoneNumbers.each as entry}
            <CardField icon={PhoneIcon} label={entryLabel(entry, $t`Phone`)} copyValue={entry.value}>
              <a class="link" href="tel:{entry.value}">{entry.value}</a>
            </CardField>
          {/each}
          {#each $chatAccounts.each as entry}
            <CardField icon={ChatIcon} label={entry.protocol ?? entryLabel(entry, $t`Chat`)} copyValue={entry.value}>
              {entry.value}
            </CardField>
          {/each}
          {#each $urls.each as entry}
            <CardField icon={WebsiteIcon} label={entryLabel(entry, $t`Website`)} copyValue={entry.value}>
              <a class="link" href={entry.value} target="_blank">{entry.value}</a>
            </CardField>
          {/each}
          {#each $streetAddresses.each as entry}
            <CardField icon={AddressIcon} label={entryLabel(entry, $t`Address`)}
              copyValue={ContactColumns.addressText(entry.value)}>
              <span class="address">{ContactColumns.addressText(entry.value)}</span>
            </CardField>
          {/each}
        </grid>
      </section>
    {/if}

    {#if $person.company || $person.position || $person.department}
      <section>
        <h2>{$t`Organization`}</h2>
        <grid class="fields">
          {#if $person.company}
            <CardField icon={CompanyIcon} label={$t`Company`}>{$person.company}</CardField>
          {/if}
          {#if $person.position}
            <CardField icon={JobIcon} label={$t`Job title`}>{$person.position}</CardField>
          {/if}
          {#if $person.department}
            <CardField icon={DepartmentIcon} label={$t`Department`}>{$person.department}</CardField>
          {/if}
        </grid>
      </section>
    {/if}

    {#if $groups.hasItems}
      <section>
        <h2>{$t`Groups`}</h2>
        <grid class="fields">
          {#each $groups.each as entry}
            <CardField icon={GroupIcon} label={entry.purposeLabel}>{entry.value}</CardField>
          {/each}
        </grid>
      </section>
    {/if}

    {#if $person.notes?.trim()}
      <section>
        <h2>{$t`Notes`}</h2>
        <div class="notes">{$person.notes}</div>
      </section>
    {/if}

    {#if !hasContactInfo && !$person.notes?.trim()}
      <hbox class="no-info">{$t`No contact information yet.`}</hbox>
    {/if}

    <hbox class="saved-in">
      <AddressbookIcon size={14} />
      {$t`Saved in ${$person.addressbook?.name ?? ""}`}
    </hbox>
  </vbox>
</vbox>

<script lang="ts">
  import type { Person, ContactEntry } from "../../logic/Abstract/Person";
  import { ContactColumns } from "./Views/ContactColumns";
  import { ContactActions } from "./ContactActions";
  import { PreferredEntry } from "./PreferredEntry";
  import ContactPicture from "./ContactPicture.svelte";
  import CardField from "./CardField.svelte";
  import CardButton from "./CardButton.svelte";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import CallIcon from "lucide-svelte/icons/phone-outgoing";
  import EditIcon from "lucide-svelte/icons/square-pen";
  import PhoneIcon from "lucide-svelte/icons/phone";
  import ChatIcon from "lucide-svelte/icons/message-circle";
  import WebsiteIcon from "lucide-svelte/icons/globe";
  import AddressIcon from "lucide-svelte/icons/map-pin";
  import CompanyIcon from "lucide-svelte/icons/building-2";
  import JobIcon from "lucide-svelte/icons/briefcase-business";
  import DepartmentIcon from "lucide-svelte/icons/network";
  import GroupIcon from "lucide-svelte/icons/users-round";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import { t } from "../../l10n/l10n";

  export let person: Person;

  $: emailAddresses = person.emailAddresses;
  $: phoneNumbers = person.phoneNumbers;
  $: chatAccounts = person.chatAccounts;
  $: streetAddresses = person.streetAddresses;
  $: urls = person.urls;
  $: groups = person.groups;

  $: jobLine = [$person.position, $person.department].filter(part => part).join(", ");
  $: preferredPhone = PreferredEntry.valueOf($phoneNumbers);
  $: hasContactInfo = $emailAddresses.hasItems || $phoneNumbers.hasItems || $chatAccounts.hasItems ||
    $urls.hasItems || $streetAddresses.hasItems;

  function entryLabel(entry: ContactEntry, kind: string): string {
    return entry.purposeLabel || kind;
  }
</script>

<style>
  .address {
    white-space: pre-line;
  }
  .contact-card {
    min-height: 0;
  }
  .header {
    align-items: start;
    gap: 20px;
    padding: 24px 24px 20px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .title {
    min-width: 0;
  }
  .name {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
  .job,
  .company {
    color: var(--lo-fg-secondary);
  }
  .job {
    margin-block-start: 2px;
  }
  .actions {
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 14px;
  }
  .sections {
    min-height: 0;
    overflow-y: auto;
    padding: 8px 16px 16px 16px;
  }
  section {
    padding-block: 8px;
  }
  section + section {
    border-block-start: 1px solid var(--lo-divider);
  }
  h2 {
    margin: 4px 8px 6px 8px;
    font-size: 15px;
    font-weight: 600;
  }
  grid.fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    column-gap: 8px;
  }
  .notes {
    margin: 0 8px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .no-info {
    margin: 16px 8px;
    color: var(--lo-fg-secondary);
  }
  .saved-in {
    align-items: center;
    gap: 6px;
    margin: 12px 8px 0 8px;
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .fields :global(.streetaddress) {
    white-space: normal;
  }
</style>
