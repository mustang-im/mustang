<div class="business-cards" role="listbox" aria-label={$t`Business Cards`} aria-multiselectable="true">
  {#each $shownContacts as contact (contact.id)}
    {@const person = contact instanceof Person ? contact : null}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="business-card" role="option" tabindex="-1"
      class:selected={$selectedPersons.contains(contact)}
      aria-selected={$selectedPersons.contains(contact)}
      on:click={event => select(event, contact)}
      on:dblclick={() => ContactActions.edit(contact)}
      on:contextmenu={event => onContextMenu(event, contact)}>
      <vbox class="picture">
        <PersonPicture person={contact} size={72} />
      </vbox>
      <vbox class="text">
        <span class="name">{contact.name || $t`(No name)`}</span>
        {#if person}
          {#if person.company}<span>{person.company}</span>{/if}
          {#if person.position}<span>{person.position}</span>{/if}
          {#each ContactColumns.businessCardLines(person) as line}
            <span class="detail">{line}</span>
          {/each}
        {:else}
          <span class="detail">{$t`Contact group`}</span>
        {/if}
      </vbox>
    </div>
  {:else}
    <vbox class="empty">{emptyText}</vbox>
  {/each}
</div>

<PersonMenu bind:this={contextMenu} />

<script lang="ts">
  import type { Contact } from "../../../logic/Abstract/Contact";
  import { Person } from "../../../logic/Abstract/Person";
  import { ContactActions } from "../ContactActions";
  import { ContactColumns } from "./ContactColumns";
  import PersonPicture from "./PersonPicture.svelte";
  import PersonMenu from "../PersonPage/PersonMenu.svelte";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { derived } from "svelte/store";
  import { t } from "../../../l10n/l10n";

  export let persons: Collection<Contact>;
  export let selected: Contact;
  export let selectedPersons: ArrayColl<Contact>;
  export let emptyText: string;

  let contextMenu: PersonMenu;

  $: shownContacts = derived($persons.contents, () => persons.contents);
  $: selected = $selectedPersons.first ?? null;

  // <copied to="CardView.svelte">
  function select(event: MouseEvent, contact: Contact) {
    if (event.ctrlKey || event.metaKey) {
      if (selectedPersons.contains(contact)) {
        selectedPersons.remove(contact);
      } else {
        selectedPersons.add(contact);
      }
      return;
    }
    selectedPersons.replaceAll([contact]);
  }
  // </copied>

  function onContextMenu(event: MouseEvent, contact: Contact) {
    contextMenu.openFor(event, contact, selectedPersons);
  }
</script>

<style>
  .business-cards {
    flex: 1 1 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    grid-auto-rows: 180px;
    align-content: start;
    gap: 16px;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
  }
  .business-card {
    display: flex;
    gap: 12px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    box-shadow: var(--lo-shadow-card, 0 1px 2px rgba(0, 0, 0, 0.08));
    cursor: default;
    overflow: hidden;
  }
  .business-card:hover {
    border-color: var(--lo-border-strong);
  }
  .business-card.selected {
    border-color: var(--lo-accent);
    box-shadow: 0 0 0 1px var(--lo-accent);
  }
  .picture {
    flex: none;
    align-items: center;
    justify-content: center;
    width: 96px;
    border-inline-end: 1px solid var(--lo-divider);
    padding-inline-end: 12px;
  }
  .text {
    min-width: 0;
    gap: 1px;
    font-size: 13px;
  }
  .text > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .name {
    margin-block-end: 2px;
    font-size: 16px;
    font-weight: 600;
    color: var(--lo-accent-text);
  }
  .detail {
    color: var(--lo-fg-secondary);
  }
  .empty {
    grid-column: 1 / -1;
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
