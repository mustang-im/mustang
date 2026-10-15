<div class="cells"
  on:dblclick={() => ContactActions.edit(contact)}
  on:contextmenu={event => onContextMenu(event, contact)}>
  <hbox class="cell name">
    <ContactPicture {contact} size={24} />
    <span class="text">
      {#if $contact.name}
        {$contact.name}
      {:else}
        <span class="lo-secondary">{$t`(No name)`}</span>
      {/if}
    </span>
  </hbox>
  <hbox class="cell"><span class="text">{person ? $person.position ?? "" : $t`Contact group`}</span></hbox>
  <hbox class="cell"><span class="text">{$person?.company ?? ""}</span></hbox>
  <hbox class="cell"><span class="text">{preferredEmail ?? ""}</span></hbox>
  <hbox class="cell"><span class="text">{preferredPhone ?? ""}</span></hbox>
</div>

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
  $: phoneNumbers = person?.phoneNumbers ?? new ArrayColl<ContactEntry>();
  $: preferredEmail = PreferredEntry.valueOf($emailAddresses);
  $: preferredPhone = PreferredEntry.valueOf($phoneNumbers);
</script>

<style>
  .cells {
    display: contents;
  }
  .cell {
    align-items: center;
    height: 36px;
    padding: 0 12px;
    border-block-end: 1px solid var(--lo-divider);
    cursor: default;
  }
  .cell.name {
    gap: 8px;
  }
  .text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cell:not(.name) {
    color: var(--lo-fg-secondary);
  }
  :global(.row:hover) > .cells > .cell {
    background-color: var(--lo-hover-bg);
  }
  :global(.row.selected) > .cells > .cell {
    background-color: var(--lo-selected-bg);
    color: var(--lo-fg);
  }
  :global(.row.selected:hover) > .cells > .cell {
    background-color: var(--lo-selected-hover-bg);
  }
</style>
