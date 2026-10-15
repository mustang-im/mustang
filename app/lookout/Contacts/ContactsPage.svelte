<vbox flex class="contacts-page" bind:this={pageEl}>
  <Ribbon>
    <RibbonTab label={$t`Home`}>
      <RibbonGroup label={$t`New`}>
        <RibbonButton label={$t`New Contact`} icon={NewContactIcon}
          onClick={() => ContactActions.newContact($selectedAddressbook)}
          shortCutInfo="Ctrl+N" />
        <RibbonButton label={$t`Contact Group`} icon={NewGroupIcon}
          onClick={() => ContactActions.newGroup($selectedAddressbook)}
          tooltip={$t`New Contact Group`}
          shortCutInfo="Ctrl+Shift+L" />
      </RibbonGroup>
      <RibbonGroup label={$t`Delete`}>
        <RibbonButton label={$t`Delete`} icon={DeleteIcon}
          onClick={deleteSelected}
          disabled={!$selectedContacts.hasItems && $t`Select a contact first`}
          shortCutInfo="Del" />
      </RibbonGroup>
      <RibbonGroup label={$t`Communicate`}>
        <RibbonButton label={$t`Email`} icon={MailIcon}
          onClick={() => ContactActions.writeMail($selectedContacts.contents)}
          disabled={!hasEmailAddress && $t`Select a contact with an email address`} />
        <RibbonButton label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting($selectedContacts.contents)}
          disabled={!hasEmailAddress && $t`Select a contact with an email address`} />
      </RibbonGroup>
      <RibbonGroup label={$t`Actions`}>
        <RibbonButton label={$t`Edit`} icon={EditIcon}
          onClick={() => ContactActions.edit(currentContact)}
          disabled={$selectedContacts.length != 1 && $t`Select a contact first`} />
        <RibbonMenuButton label={$t`Move`} icon={MoveIcon}
          disabled={!$selectedContacts.hasItems && $t`Select a contact first`}>
          {#each addressbookSections as section}
            <MenuLabel label={section.mainAccount?.name ?? $t`My Contacts`} />
            {#each section.addressbooks as addressbook (addressbook.id)}
              <MenuItem label={addressbook.name} icon={AddressbookIcon}
                disabled={selectionIsIn(addressbook)}
                onClick={() => ContactActions.moveTo($selectedContacts.contents, addressbook)} />
            {/each}
          {/each}
        </RibbonMenuButton>
        <RibbonMenuButton label={$t`Copy`} icon={CopyIcon}
          disabled={!hasPersons && $t`Select a contact first`}>
          {#each addressbookSections as section}
            <MenuLabel label={section.mainAccount?.name ?? $t`My Contacts`} />
            {#each section.addressbooks as addressbook (addressbook.id)}
              <MenuItem label={addressbook.name} icon={AddressbookIcon}
                disabled={selectionIsIn(addressbook)}
                onClick={() => ContactActions.copyTo($selectedContacts.contents, addressbook)} />
            {/each}
          {/each}
        </RibbonMenuButton>
      </RibbonGroup>
      <RibbonGroup label={$t`Current View`}>
        <RibbonToggleButton label={$t`People`} icon={PeopleViewIcon}
          bind:checked={isPeopleView} onChange={() => setView("people")} />
        <RibbonToggleButton label={$t`List`} icon={ListViewIcon}
          bind:checked={isListView} onChange={() => setView("list")} />
      </RibbonGroup>
      <RibbonGroup label={$t`Find`}>
        <RibbonButton label={$t`Search`} icon={SearchIcon}
          tooltip={$t`Search People`}
          onClick={() => searchField.focus()}
          shortCutInfo="Ctrl+E" />
      </RibbonGroup>
    </RibbonTab>
    <RibbonTab label={$t`Send / Receive`}>
      <RibbonGroup label={$t`Send & Receive`}>
        <RibbonButton label={$t`Update Folder`} icon={SyncIcon}
          onClick={() => ContactActions.sync($selectedAddressbook)}
          disabled={!$selectedAddressbook?.canSync && $t`Select an address book on a server first`} />
        <RibbonButton label={$t`Update All`} icon={SyncAllIcon}
          onClick={syncAll}
          disabled={!$addressbooks.some(addressbook => addressbook.canSync) && $t`None of your address books is on a server`} />
      </RibbonGroup>
    </RibbonTab>
    <RibbonTab label={$t`Folder`}>
      <RibbonGroup label={$t`Properties`}>
        <RibbonButton label={$t`Import / Export`} icon={ImportIcon}
          onClick={() => openSettingsCategoryForAccount($selectedAddressbook, "contacts-import")}
          disabled={!isWritableAddressbook && $t`Select an address book first`} />
        <RibbonButton label={$t`Address Book Properties`} icon={PropertiesIcon}
          onClick={() => openSettingsCategoryForAccount($selectedAddressbook)}
          disabled={!$selectedAddressbook && $t`Select an address book first`} />
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>

  <hbox flex class="panes">
    <Splitter name="lookout.contacts.addressbooks" initialRightRatio={5} leftMinWidth={200} rightMinWidth={480}>
      <AddressbookPane slot="left" {allContacts} />
      <hbox flex class="main" slot="right">
        {#if isListView}
          <vbox flex class="list-pane lo-card single">
            <hbox class="search-bar">
              <SearchField bind:this={searchField} bind:searchTerm placeholder={searchPlaceholder} />
            </hbox>
            <ContactTable contacts={sortedContacts} bind:selectedContact={currentContact} bind:selectedContacts {emptyText} />
          </vbox>
        {:else}
          <Splitter name="lookout.contacts.card" initialRightRatio={1.6} leftMinWidth={260} rightMinWidth={320}>
            <vbox flex class="list-pane lo-card" slot="left">
              <hbox class="search-bar">
                <SearchField bind:this={searchField} bind:searchTerm placeholder={searchPlaceholder} />
              </hbox>
              <ContactList contacts={sortedContacts} bind:selectedContact={currentContact} bind:selectedContacts {emptyText} />
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
        {/if}
      </hbox>
    </Splitter>
  </hbox>
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person } from "../../logic/Abstract/Person";
  import { Group } from "../../logic/Abstract/Group";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { selectedAddressbook, selectedContact } from "./Selected";
  import { ContactActions } from "./ContactActions";
  import { ContactSearch } from "./ContactSearch";
  import { LetterIndex } from "./LetterIndex";
  import { AddressbookSections } from "./AddressbookSections";
  import { appGlobal } from "../../logic/app";
  import { selectedPerson } from "../../frontend/Contacts/Person/Selected";
  import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
  import { openSettingsCategoryForAccount } from "../../frontend/Settings/Window/CategoriesUtils";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { catchErrors } from "../../frontend/Util/error";
  import { statusBar } from "../MainWindow/StatusBar";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../frontend/Shared/Menu/MenuLabel.svelte";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import SearchField from "../../frontend/Shared/SearchField.svelte";
  import AddressbookPane from "./AddressbookPane.svelte";
  import ContactList from "./ContactList.svelte";
  import ContactTable from "./ContactTable.svelte";
  import ContactCard from "./ContactCard.svelte";
  import GroupCard from "./GroupCard.svelte";
  import NewContactIcon from "lucide-svelte/icons/user-round-plus";
  import NewGroupIcon from "lucide-svelte/icons/users-round";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import EditIcon from "lucide-svelte/icons/square-pen";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/copy";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import PeopleViewIcon from "lucide-svelte/icons/contact-round";
  import ListViewIcon from "lucide-svelte/icons/table-properties";
  import SearchIcon from "lucide-svelte/icons/search";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import SyncAllIcon from "lucide-svelte/icons/refresh-ccw-dot";
  import ImportIcon from "lucide-svelte/icons/file-input";
  import PropertiesIcon from "lucide-svelte/icons/settings-2";
  import MultipleIcon from "lucide-svelte/icons/users-round";
  import NoSelectionIcon from "lucide-svelte/icons/contact-round";
  import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
  import { onDestroy } from "svelte";
  import { t } from "../../l10n/l10n";

  let addressbooks = appGlobal.addressbooks;
  let searchOnlyAddressbooks = appGlobal.searchOnlyAddressbooks;
  const allContacts = mergeColls(appGlobal.addressbooks.map(addressbook => addressbook.contacts)) as Collection<Contact>;

  const viewSetting = getLocalStorage<"people" | "list">("lookout.contacts.view", "people");
  let isPeopleView = viewSetting.value != "list";
  let isListView = !isPeopleView;
  function setView(view: "people" | "list") {
    viewSetting.value = view;
    isPeopleView = view == "people";
    isListView = view == "list";
  }

  let searchField: SearchField;
  let searchTerm: string | null = null;
  let lastGlobalSearchTerm = $globalSearchTerm;
  $: takeGlobalSearchTerm($globalSearchTerm);
  function takeGlobalSearchTerm(term: string | null) {
    if (term == lastGlobalSearchTerm) {
      return;
    }
    lastGlobalSearchTerm = term;
    searchTerm = term?.toLowerCase() || null;
  }

  $: addressbookSections = new AddressbookSections($addressbooks.contents).sections;
  $: isDirectory = !!$selectedAddressbook && $searchOnlyAddressbooks.some(addressbook => addressbook == $selectedAddressbook);
  $: isWritableAddressbook = !!$selectedAddressbook && $addressbooks.contains($selectedAddressbook);
  $: searchedAddressbooks = $selectedAddressbook
    ? [ $selectedAddressbook ]
    : [ ...$addressbooks.contents, ...$searchOnlyAddressbooks.contents ];
  $: listedContacts = searchTerm
    ? ContactSearch.search(searchedAddressbooks, searchTerm)
    : isDirectory
      ? new ArrayColl<Contact>()
      : $selectedAddressbook?.contacts ?? allContacts;
  $: sortedContacts = listedContacts.sort(LetterIndex.compareByName);
  $: searchPlaceholder = $selectedAddressbook
    ? $t`Search ${$selectedAddressbook.name}`
    : $t`Search all contacts`;
  $: emptyText = searchTerm
    ? $t`We didn't find any contact for "${searchTerm}".`
    : isDirectory
      ? $t`Type a name in the search box to find people in the directory.`
      : $t`There are no contacts in this address book yet.`;

  let selectedContacts = new ArrayColl<Contact>();
  let currentContact: Contact | null = $selectedPerson && $selectedPerson != $selectedContact
    ? $selectedPerson
    : $selectedContact;
  $: showPersonFromOutside($selectedPerson);
  function showPersonFromOutside(person: Person | null) {
    if (!person || person == currentContact) {
      return;
    }
    if ($selectedAddressbook && person.addressbook != $selectedAddressbook) {
      $selectedAddressbook = person.addressbook;
    }
    currentContact = person;
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

  $: hasEmailAddress = ContactActions.hasEmailAddress($selectedContacts.contents);
  $: hasPersons = $selectedContacts.some(contact => contact instanceof Person);
  function selectionIsIn(addressbook: Addressbook): boolean {
    return selectedContacts.hasItems && selectedContacts.every(contact => contact.addressbook == addressbook);
  }

  async function deleteSelected() {
    await ContactActions.deleteContacts(selectedContacts.contents);
  }

  async function syncAll() {
    await Promise.all(addressbooks.contents
      .filter(addressbook => addressbook.canSync)
      .map(addressbook => ContactActions.sync(addressbook)));
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
    } else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "n") {
      event.preventDefault();
      catchErrors(() => ContactActions.newContact($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && event.shiftKey && event.key.toLowerCase() == "l") {
      event.preventDefault();
      catchErrors(() => ContactActions.newGroup($selectedAddressbook));
    } else if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "e") {
      event.preventDefault();
      searchField?.focus();
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
  .search-bar :global(.search) {
    flex: 1;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 4px 0 10px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg-secondary);
  }
  .search-bar :global(.search:focus-within) {
    border-color: var(--lo-accent);
    box-shadow: inset 0 -1px 0 var(--lo-accent);
  }
  .search-bar :global(.search input) {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--lo-fg);
    font: inherit;
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
