<hbox class="contact-item"
  on:dblclick={() => ContactActions.edit(contact)}
  on:contextmenu={event => onContextMenu(event, contact)}
  title={$contact.name}>
  <ContactPicture {contact} size={40} />
  <vbox class="text">
    <hbox class="name">
      {#if $contact.name}
        {$contact.name}
      {:else}
        <span class="lo-secondary">{$t`(No name)`}</span>
      {/if}
    </hbox>
    {#if secondLine}
      <hbox class="second-line">{secondLine}</hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person, type ContactEntry } from "../../logic/Abstract/Person";
  import { ContactActions } from "./ContactActions";
  import { PreferredEntry } from "./PreferredEntry";
  import ContactPicture from "./ContactPicture.svelte";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let contact: Contact;
  export let onContextMenu: (event: MouseEvent, contact: Contact) => void;

  $: person = contact instanceof Person ? contact : null;
  $: emailAddresses = person?.emailAddresses ?? new ArrayColl<ContactEntry>();
  $: preferredEmail = PreferredEntry.valueOf($emailAddresses);
  $: secondLine = person
    ? preferredEmail || $person.company || $person.position
    : $t`Contact group`;
</script>

<style>
  .contact-item {
    position: relative;
    align-items: center;
    box-sizing: border-box;
    height: 56px;
    border-block-end: 1px solid var(--lo-divider);
    cursor: default;
  }
  .contact-item:hover {
    background-color: var(--lo-hover-bg);
  }
  :global(.row.selected) > .contact-item {
    background-color: var(--lo-selected-bg);
  }
  :global(.row.selected) > .contact-item:hover {
    background-color: var(--lo-selected-hover-bg);
  }
  :global(.row.selected) > .contact-item::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: var(--lo-accent);
  }
  .text {
    flex: 1;
    min-width: 0;
    margin-inline-start: 12px;
  }
  .name {
    font-size: 15px;
  }
  .name,
  .second-line {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .second-line {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
</style>
