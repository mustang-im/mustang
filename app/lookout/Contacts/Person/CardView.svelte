<div class="address-cards" role="listbox" aria-label={$t`Cards *=> List of contacts shown as address cards`} aria-multiselectable="true">
  {#each $shownContacts as contact (contact.id)}
    {@const person = contact instanceof Person ? contact : null}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="address-card" role="option" tabindex="-1"
      class:selected={$selectedPersons.contains(contact)}
      aria-selected={$selectedPersons.contains(contact)}
      on:click={event => select(event, contact)}
      on:dblclick={() => ContactActions.edit(contact)}
      on:contextmenu={event => contextMenu.openFor(event, contact, selectedPersons)}>
      <div class="card-name">{contact.name || $t`(No name)`}</div>
      {#if person}
        <div class="fields">
          {#each addressCardFields(person) as field}
            <span class="label">{field.label}</span>
            <span class="value">{field.value}</span>
          {/each}
        </div>
      {:else}
        <div class="fields"><span class="label">{$t`Contact group`}</span></div>
      {/if}
    </div>
  {:else}
    <div class="empty">{emptyText}</div>
  {/each}
</div>

<PersonMenu bind:this={contextMenu} />

<script lang="ts">
  import type { Contact } from "../../../logic/Abstract/Contact";
  import { Person } from "../../../logic/Abstract/Person";
  import { ContactActions } from "../ContactActions";
  import { addressCardFields } from "./ContactColumns";
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

  // <copied from="BusinessCardView.svelte">
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
</script>

<style>
  .address-cards {
    flex: 1 1 0;
    min-height: 0;
    padding: 12px 16px;
    column-width: 260px;
    column-gap: 24px;
    column-fill: auto;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .address-card {
    break-inside: avoid;
    margin-block-end: 14px;
    cursor: default;
  }
  .card-name {
    padding: 2px 6px;
    border-block-start: 2px solid var(--lo-border-strong);
    background-color: var(--lo-pane-alt-bg);
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .address-card:hover .card-name {
    background-color: var(--lo-hover-bg);
  }
  .address-card.selected .card-name {
    border-block-start-color: var(--lo-accent);
    background-color: var(--lo-selected-bg);
  }
  .fields {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 8px;
    padding: 2px 6px;
    font-size: 13px;
  }
  .label {
    color: var(--lo-fg-secondary);
  }
  .value {
    white-space: pre-line;
    overflow-wrap: anywhere;
  }
  .empty {
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
