<vbox flex class="addressbook-pane">
  <vbox class="scroll">
    <AddressbookItem
      label={$t`All contacts`}
      icon={AllContactsIcon}
      count={$allContacts.length}
      isSelected={!$selectedAddressbook}
      indented={false}
      onSelect={() => $selectedAddressbook = null} />

    {#each sections as section (section.mainAccount ?? section)}
      {@const sectionID = section.mainAccount?.id ?? "local"}
      <button class="section-header"
        on:click={() => toggleSection(sectionID)}
        aria-expanded={!collapsedSections.has(sectionID)}
        title={section.mainAccount?.name ?? $t`My Contacts`}>
        <ChevronIcon size={14} class="chevron {collapsedSections.has(sectionID) ? 'collapsed' : ''}" />
        <span class="section-label">{section.mainAccount?.name ?? $t`My Contacts`}</span>
      </button>
      {#if !collapsedSections.has(sectionID)}
        {#each section.addressbooks as addressbook (addressbook.id)}
          <AddressbookItem {addressbook}
            isSelected={$selectedAddressbook == addressbook}
            onSelect={() => $selectedAddressbook = addressbook} />
        {/each}
      {/if}
    {/each}

    {#if $searchOnlyAddressbooks.hasItems}
      <button class="section-header"
        on:click={() => toggleSection("directory")}
        aria-expanded={!collapsedSections.has("directory")}>
        <ChevronIcon size={14} class="chevron {collapsedSections.has('directory') ? 'collapsed' : ''}" />
        <span class="section-label">{$t`Directory`}</span>
      </button>
      {#if !collapsedSections.has("directory")}
        {#each $searchOnlyAddressbooks.each as addressbook (addressbook.id)}
          <AddressbookItem {addressbook}
            icon={DirectoryIcon}
            isSelected={$selectedAddressbook == addressbook}
            onSelect={() => $selectedAddressbook = addressbook} />
        {/each}
      {/if}
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { selectedAddressbook } from "./Selected";
  import { AddressbookSections } from "./AddressbookSections";
  import { appGlobal } from "../../logic/app";
  import AddressbookItem from "./AddressbookItem.svelte";
  import AllContactsIcon from "lucide-svelte/icons/contact-round";
  import DirectoryIcon from "lucide-svelte/icons/building-2";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import type { Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let allContacts: Collection<Contact>;

  let addressbooks = appGlobal.addressbooks;
  let searchOnlyAddressbooks = appGlobal.searchOnlyAddressbooks;
  $: sections = new AddressbookSections($addressbooks.contents).sections;

  let collapsedSections = new Set<string>();
  function toggleSection(id: string) {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
    collapsedSections = collapsedSections;
  }
</script>

<style>
  .addressbook-pane {
    min-height: 0;
    padding: 4px 4px 8px 8px;
  }
  .scroll {
    overflow-y: auto;
    min-height: 0;
    flex: 1 0 0;
  }
  .section-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    margin-block-start: 12px;
    padding: 4px 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }
  .section-header:hover {
    background-color: var(--lo-hover-bg);
  }
  .section-header :global(.chevron) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
    transition: transform 0.1s;
  }
  .section-header :global(.chevron.collapsed) {
    transform: rotate(-90deg);
  }
  .section-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
