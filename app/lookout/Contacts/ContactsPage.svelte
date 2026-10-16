<vbox flex class="contacts-page" bind:this={pageEl}>
  <ContactsRibbon {selectedContacts} {addressbookSections} {isWritableAddressbook}
    onDelete={deleteSelected} onSearch={focusSearch} onShowContact={showContact} {resetView}>
    {#if isSearch}
      <ContactSearchTab hasSelectedAddressbook={!!$selectedAddressbook} />
      <RibbonTabSelector label={$t`Search`} />
    {/if}
  </ContactsRibbon>

  <hbox flex class="panes">
    <Splitter name="lookout.contacts.addressbooks" initialRightRatio={5} leftMinWidth={200} rightMinWidth={480}
      hasLeft={$folderPane.value != false}>
      <AddressbookPane slot="left" {allContacts} />
      <hbox flex class="main" slot="right">
        <Splitter name="lookout.contacts.card" initialRightRatio={1.6} leftMinWidth={260} rightMinWidth={320}
          hasRight={showCardPane}>
          <vbox flex class="list-pane lo-card" class:single={!showCardPane} slot="left">
            <hbox class="search-bar">
              <ContactSearchBox bind:this={searchBox} placeholder={searchPlaceholder} />
            </hbox>
            {#if view == ContactView.People}
              <ContactList contacts={sortedContacts} bind:selectedContact={currentContact} bind:selectedContacts {emptyText} />
            {:else if view == ContactView.BusinessCard}
              <BusinessCardView contacts={sortedContacts} bind:selectedContact={currentContact} {selectedContacts} {emptyText} />
            {:else if view == ContactView.Card}
              <CardView contacts={sortedContacts} bind:selectedContact={currentContact} {selectedContacts} {emptyText} />
            {:else}
              <ContactTable contacts={sortedContacts} columns={ContactColumns.columnsOf(view)}
                bind:selectedContact={currentContact} bind:selectedContacts {emptyText} />
            {/if}
          </vbox>
          <vbox flex class="card-pane lo-card" slot="right">
            {#if $selectedContacts.length > 1}
              <vbox flex class="card-placeholder">
                <MultipleIcon size={48} strokeWidth={1.2} />
                {$t`${$selectedContacts.length} contacts selected`}
              </vbox>
            {:else if currentContact instanceof Person}
              <ContactCard person={currentContact} />
            {:else if currentContact instanceof Group}
              <GroupCard group={currentContact} />
            {:else}
              <vbox flex class="card-placeholder">
                <NoSelectionIcon size={48} strokeWidth={1.2} />
                {$t`Select a contact to see the details`}
              </vbox>
            {/if}
          </vbox>
        </Splitter>
      </hbox>
    </Splitter>
  </hbox>
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person } from "../../logic/Abstract/Person";
  import { Group } from "../../logic/Abstract/Group";
  import { selectedAddressbook, selectedContact } from "./Selected";
  import { ContactActions } from "./ContactActions";
  import { ContactSearch, ContactSearchScope } from "./ContactSearch";
  import { ContactColumns, ContactView } from "./Views/ContactColumns";
  import { LetterIndex } from "./LetterIndex";
  import { AddressbookSections } from "./AddressbookSections";
  import { appGlobal } from "../../logic/app";
  import { selectedPerson } from "../../frontend/Contacts/Person/Selected";
  import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import { catchErrors } from "../../frontend/Util/error";
  import { statusBar } from "../MainWindow/StatusBar";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import RibbonTabSelector from "../Mail/Ribbon/RibbonTabSelector.svelte";
  import ContactsRibbon from "./ContactsRibbon.svelte";
  import ContactSearchTab from "./ContactSearchTab.svelte";
  import ContactSearchBox from "./ContactSearchBox.svelte";
  import AddressbookPane from "./AddressbookPane.svelte";
  import ContactList from "./ContactList.svelte";
  import ContactTable from "./ContactTable.svelte";
  import BusinessCardView from "./Views/BusinessCardView.svelte";
  import CardView from "./Views/CardView.svelte";
  import ContactCard from "./ContactCard.svelte";
  import GroupCard from "./GroupCard.svelte";
  import MultipleIcon from "lucide-svelte/icons/users-round";
  import NoSelectionIcon from "lucide-svelte/icons/contact-round";
  import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
  import { onDestroy } from "svelte";
  import { t } from "../../l10n/l10n";

  let addressbooks = appGlobal.addressbooks;
  let searchOnlyAddressbooks = appGlobal.searchOnlyAddressbooks;
  const allContacts = mergeColls(appGlobal.addressbooks.map(addressbook => addressbook.contacts)) as Collection<Contact>;

  const viewSetting = ContactColumns.view;
  const sort = ContactColumns.sort;
  const folderPane = ContactColumns.folderPane;
  const readingPane = ContactColumns.readingPane;
  const searchOptions = ContactSearch.options;

  $: view = Object.values(ContactView).includes($viewSetting.value) ? $viewSetting.value : ContactView.People;
  $: showCardPane = $readingPane.value != false && view == ContactView.People;

  let searchBox: ContactSearchBox;
  let lastGlobalSearchTerm = $globalSearchTerm;
  $: takeGlobalSearchTerm($globalSearchTerm);
  function takeGlobalSearchTerm(term: string | null) {
    if (term == lastGlobalSearchTerm) {
      return;
    }
    lastGlobalSearchTerm = term;
    ContactSearch.update({ term: term?.toLowerCase() || null });
  }

  $: addressbookSections = new AddressbookSections($addressbooks.contents).sections;
  $: isDirectory = !!$selectedAddressbook && $searchOnlyAddressbooks.some(addressbook => addressbook == $selectedAddressbook);
  $: isWritableAddressbook = !!$selectedAddressbook && $addressbooks.contains($selectedAddressbook);
  $: isSearch = ContactSearch.isActive($searchOptions);
  $: isCurrentFolder = $searchOptions.scope == ContactSearchScope.CurrentFolder && !!$selectedAddressbook;
  $: searchedAddressbooks = isCurrentFolder
    ? [ $selectedAddressbook ]
    : [ ...$addressbooks.contents, ...$searchOnlyAddressbooks.contents ];
  $: folderContacts = isDirectory
    ? new ArrayColl<Contact>()
    : $selectedAddressbook?.contacts ?? allContacts;
  $: listedContacts = isSearch
    ? ContactSearch.results(searchedAddressbooks, isCurrentFolder ? folderContacts : allContacts, $searchOptions)
    : folderContacts;
  $: sortedContacts = view == ContactView.List || view == ContactView.Phone
    ? listedContacts.sort(ContactColumns.compare($sort.value))
    : listedContacts.sort(LetterIndex.compareByName);
  $: searchPlaceholder = $selectedAddressbook
    ? $t`Search ${$selectedAddressbook.name}`
    : $t`Search All Contacts`;
  $: emptyText = isSearch
    ? $t`We didn't find anything to show here.`
    : isDirectory
      ? $t`Type a name in the search box to find people in the directory.`
      : $t`There are no items to show in this view.`;

  let selectedContacts = new ArrayColl<Contact>();
  let currentContact: Contact | null = $selectedPerson && $selectedPerson != $selectedContact
    ? $selectedPerson
    : $selectedContact;
  if (currentContact) {
    selectedContacts.add(currentContact);
  }
  $: showContactFromOutside($selectedContact);
  function showContactFromOutside(contact: Contact | null) {
    if (!contact || contact == currentContact) {
      return;
    }
    if ($selectedAddressbook && contact.addressbook != $selectedAddressbook) {
      $selectedAddressbook = contact.addressbook;
    }
    currentContact = contact;
    selectedContacts.replaceAll([contact]);
  }
  $: showPersonFromOutside($selectedPerson);
  function showPersonFromOutside(person: Person | null) {
    showContactFromOutside(person);
  }
  $: clearSelectionWhenEmpty($sortedContacts.isEmpty);
  function clearSelectionWhenEmpty(isEmpty: boolean) {
    if (!isEmpty) {
      return;
    }
    selectedContacts.clear();
    currentContact = null;
  }
  $: rememberSelection(currentContact);
  function rememberSelection(contact: Contact | null) {
    $selectedContact = contact;
    let person = contact instanceof Person ? contact : null;
    if ($selectedPerson != person) {
      $selectedPerson = person;
    }
  }

  async function deleteSelected() {
    await ContactActions.deleteContacts(selectedContacts.contents);
  }

  function focusSearch() {
    searchBox?.focus();
  }

  function showContact(contact: Contact) {
    ContactSearch.close();
    ContactActions.show(contact);
  }

  function resetView() {
    ContactColumns.view.value = ContactView.People;
    ContactColumns.sort.value = ContactColumns.sort.defaultValue;
    ContactColumns.folderPane.value = true;
    ContactColumns.readingPane.value = true;
  }

  const status = statusBar.addSection();
  onDestroy(() => status.remove());
  $: status.left = [
    { label: $t`Items: ${$sortedContacts.length}` },
    ...($selectedContacts.length > 1 ? [{ label: $t`Selected: ${$selectedContacts.length}` }] : []),
  ];

  let pageEl: HTMLElement;
  function onKeyDown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;
    if (!pageEl?.contains(target) && target != document.body) {
      return;
    }
    let isTextField = target?.closest?.("input, textarea, select, [contenteditable]");
    if (event.key == "Delete" && !isTextField && !event.ctrlKey && !event.altKey && selectedContacts.hasItems) {
      event.preventDefault();
      catchErrors(deleteSelected);
    } else if (event.key == "Escape" && !isTextField && isSearch) {
      event.preventDefault();
      ContactSearch.close();
    } else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "n") {
      event.preventDefault();
      catchErrors(() => ContactActions.newContact($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && event.shiftKey && event.key.toLowerCase() == "l") {
      event.preventDefault();
      catchErrors(() => ContactActions.newGroup($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "e") {
      event.preventDefault();
      focusSearch();
    }
  }
</script>

<style>
  .contacts-page {
    min-height: 0;
  }
  .panes {
    min-height: 0;
  }
  .main {
    min-width: 0;
  }
  .list-pane {
    min-width: 0;
    margin: 0 4px 8px 0;
    overflow: hidden;
  }
  .list-pane.single {
    margin-inline-end: 8px;
  }
  .card-pane {
    min-width: 0;
    margin: 0 8px 8px 4px;
    overflow: hidden;
  }
  .search-bar {
    flex-shrink: 0;
    padding: 12px 12px 8px 12px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .card-placeholder {
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--lo-fg-secondary);
  }
  .card-placeholder :global(svg) {
    color: var(--lo-fg-disabled);
  }
</style>
