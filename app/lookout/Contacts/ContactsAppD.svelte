<vbox flex class="contacts-page" bind:this={pageEl}>
  <ContactsRibbon {selectedContacts} {addressbookSections} {isWritableAddressbook}
    onDelete={deleteSelected} onSearch={focusSearch} onShowContact={showContact} {resetView}>
    {#if isSearch}
      <ContactSearchTab hasSelectedAddressbook={!!$selectedAddressbook} />
    {/if}
  </ContactsRibbon>

  <hbox flex class="panes">
    <Splitter name="lookout.contacts.addressbooks" initialRightRatio={5} leftMinWidth={200} rightMinWidth={480}
      hasLeft={$folderPane.value != false}>
      <AddressbookSelector slot="left" {allContacts} />
      <hbox flex class="main" slot="right">
        <Splitter name="lookout.contacts.card" initialRightRatio={1.6} leftMinWidth={260} rightMinWidth={320}
          hasRight={showCardPane}>
          <vbox flex class="list-pane lo-card" class:single={!showCardPane} slot="left">
            <hbox class="search-bar">
              <ContactSearchBox bind:this={searchBox} placeholder={searchPlaceholder} />
            </hbox>
            {#if view == ContactView.People}
              <PersonsList contacts={sortedContacts} bind:selectedContact={currentContact} bind:selectedContacts {emptyText} />
            {:else if view == ContactView.BusinessCard}
              <BusinessCardView contacts={sortedContacts} bind:selectedContact={currentContact} {selectedContacts} {emptyText} />
            {:else if view == ContactView.Card}
              <CardView contacts={sortedContacts} bind:selectedContact={currentContact} {selectedContacts} {emptyText} />
            {:else}
              <PersonsTable contacts={sortedContacts} columns={ContactColumns.shownColumns($columnsSetting.value)} {view}
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
              <PersonDetails person={currentContact} />
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
  import { selectedAddressbook, selectedContact } from "./Person/Selected";
  import { ContactActions } from "./ContactActions";
  import { ContactSearch, ContactSearchScope } from "./ContactSearch";
  import { ContactColumn, ContactColumns, ContactView, type ContactSort } from "./Person/ContactColumns";
  import { LetterIndex } from "./LetterIndex";
  import { AddressbookSections } from "./AddressbookSections";
  import { ObservedItems } from "../Shared/ObservedItems";
  import { appGlobal } from "../../logic/app";
  import { selectedPerson } from "../../frontend/Contacts/Person/Selected";
  import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import { catchErrors } from "../../frontend/Util/error";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { statusBarContent, type StatusBarContent } from "../MainWindow/StatusBar.svelte";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import ContactsRibbon from "./ContactsRibbon.svelte";
  import ContactSearchTab from "./Search/ContactSearchTab.svelte";
  import ContactSearchBox from "./Search/ContactSearchBox.svelte";
  import AddressbookSelector from "./AddressbookSelector.svelte";
  import PersonsList from "./Person/PersonsList.svelte";
  import PersonsTable from "./Person/PersonsTable.svelte";
  import BusinessCardView from "./Person/BusinessCardView.svelte";
  import CardView from "./Person/CardView.svelte";
  import PersonDetails from "./PersonPage/PersonDetails.svelte";
  import GroupCard from "./PersonPage/GroupCard.svelte";
  import MultipleIcon from "lucide-svelte/icons/users-round";
  import NoSelectionIcon from "lucide-svelte/icons/contact-round";
  import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
  import { onDestroy } from "svelte";
  import { get } from "svelte/store";
  import { t } from "../../l10n/l10n";

  let addressbooks = appGlobal.addressbooks;
  let searchOnlyAddressbooks = appGlobal.searchOnlyAddressbooks;
  const allContacts = mergeColls(appGlobal.addressbooks.map(addressbook => addressbook.contacts)) as Collection<Contact>;

  const viewSetting = getLocalStorage<ContactView>("lookout.contacts.view", ContactView.People);
  const sort = getLocalStorage<ContactSort>("lookout.contacts.sort", { column: ContactColumn.FullName, ascending: true });
  const folderPane = getLocalStorage<boolean>("lookout.contacts.folderPane", true);
  const readingPane = getLocalStorage<boolean>("lookout.contacts.readingPane", true);
  const searchOptions = ContactSearch.options;

  $: view = Object.values(ContactView).includes($viewSetting.value) ? $viewSetting.value : ContactView.People;
  $: showCardPane = $readingPane.value != false && view == ContactView.People;
  $: columnsSetting = getLocalStorage<ContactColumn[]>(view == ContactView.Phone ? "lookout.contacts.phone.columns" : "lookout.contacts.list.columns", ContactColumns.defaultColumns(view));

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
  $: compareContacts = view == ContactView.List || view == ContactView.Phone
    ? ContactColumns.compare($sort.value)
    : LetterIndex.compareByName;
  $: sortedContacts = listedContacts.sort(compareContacts);
  $: observedContacts = ObservedItems.of(sortedContacts);
  $: sortAgainWhenChanged($observedContacts);
  function sortAgainWhenChanged(contacts: Contact[]) {
    if (contacts.some((contact, i) => i > 0 && compareContacts(contacts[i - 1], contact) > 0)) {
      sortedContacts = listedContacts.sort(compareContacts);
    }
  }
  $: shownAddressbook = $selectedAddressbook;
  $: searchPlaceholder = $shownAddressbook
    ? $t`Search ${$shownAddressbook.name}`
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
    viewSetting.value = ContactView.People;
    sort.value = sort.defaultValue;
    for (let tableView of [ContactView.List, ContactView.Phone]) {
      getLocalStorage<ContactColumn[]>(tableView == ContactView.Phone ? "lookout.contacts.phone.columns" : "lookout.contacts.list.columns", ContactColumns.defaultColumns(tableView)).value = ContactColumns.defaultColumns(tableView);
      getLocalStorage<ContactSort | null>(tableView == ContactView.Phone ? "lookout.contacts.phone.groupBy" : "lookout.contacts.list.groupBy", ContactColumns.defaultGroupBy(tableView)).value = ContactColumns.defaultGroupBy(tableView);
    }
    folderPane.value = true;
    readingPane.value = true;
  }

  let status: StatusBarContent;
  $: status = {
    left: [
      { label: $t`Items: ${$sortedContacts.length}` },
      ...($selectedContacts.length > 1 ? [{ label: $t`Selected: ${$selectedContacts.length}` }] : []),
    ],
    right: [],
    views: [],
  };
  // <copied from="../Mail/MailApp.svelte">
  $: $statusBarContent = status;
  onDestroy(() => {
    if (get(statusBarContent) == status) {
      statusBarContent.set(null);
    }
  });
  // </copied>

  let pageEl: HTMLElement;
  function onKeyDown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;
    if (event.defaultPrevented || !pageEl?.contains(target) && target != document.body) {
      return;
    }
    let isTextField = target?.closest?.("input, textarea, select, [contenteditable]");
    if (event.key == "Delete" && !isTextField && !event.ctrlKey && !event.altKey && selectedContacts.hasItems) {
      event.preventDefault();
      catchErrors(deleteSelected);
    } else if (event.key == "Escape" && !isTextField && isSearch) {
      event.preventDefault();
      ContactSearch.close();
    } else if (event.ctrlKey && !event.altKey && event.key.toLowerCase() == "n" && !event.shiftKey ||
        event.ctrlKey && !event.altKey && event.key.toLowerCase() == "c" && event.shiftKey) {
      event.preventDefault();
      catchErrors(() => ContactActions.newContact($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && event.shiftKey && event.key.toLowerCase() == "l") {
      event.preventDefault();
      catchErrors(() => ContactActions.newGroup($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "e" ||
        event.key == "F3" && !event.ctrlKey && !event.altKey && !event.shiftKey) {
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
