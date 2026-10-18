<Ribbon>
  <RibbonTab label={$t`Home`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Contact`} icon={NewContactIcon}
        onClick={() => ContactActions.newContact(selectedAddressbook)}
        shortCutInfo="Ctrl+N" />
      <RibbonButton label={$t`New Contact Group`} shortLabel={$t`New Group`} icon={NewGroupIcon}
        onClick={() => ContactActions.newGroup(selectedAddressbook)}
        shortCutInfo="Ctrl+Shift+L" />
      <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon}>
        <MenuItem label={$t`Contact`} icon={NewContactIcon}
          onClick={() => ContactActions.newContact(selectedAddressbook)} />
        <MenuItem label={$t`Contact Group`} icon={NewGroupIcon}
          onClick={() => ContactActions.newGroup(selectedAddressbook)} />
        <MenuDivider />
        <MenuItem label={$t`E-mail Message`} icon={MailIcon}
          onClick={() => ContactActions.writeMail($selectedPersons.contents)} />
        <MenuItem label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting($selectedPersons.contents)} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Delete`}>
      <RibbonButton label={$t`Delete`} icon={DeleteIcon}
        onClick={onDelete}
        disabled={!$selectedPersons.hasItems && $t`Select a contact first`}
        shortCutInfo="Del" />
    </RibbonGroup>
    <RibbonGroup label={$t`Communicate`}>
      <RibbonButton label={$t`Email`} icon={MailIcon}
        onClick={() => ContactActions.writeMail($selectedPersons.contents)}
        disabled={!hasEmailAddress && $t`Select a contact with an email address`} />
      <RibbonButton label={$t`Meeting`} icon={MeetingIcon}
        onClick={() => ContactActions.newMeeting($selectedPersons.contents)}
        disabled={!hasEmailAddress && $t`Select a contact with an email address`} />
      <RibbonMenuButton label={$t`More`} icon={MoreIcon} size="small"
        disabled={!selectedPerson && $t`Select a contact first`}>
        <SubMenu label={$t`Call`} icon={CallIcon} disabled={!phoneNumbers.length && $t`The contact has no phone number`}>
          {#each phoneNumbers as entry}
            <MenuItem label={`${entry.value} (${entry.purposeLabel || $t`Phone`})`} icon={CallIcon}
              onClick={() => ContactActions.call(entry.value)} />
          {/each}
        </SubMenu>
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Current View`}>
      <RibbonMenuButton label={$t`Change View`} shortLabel={$t`Views`} icon={ChangeViewIcon}>
        <ChangeViewGallery views={contactViews} currentView={$view.value} on:change={event => setView(event.detail)} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Actions`}>
      <RibbonMenuButton label={$t`Move`} icon={MoveIcon}
        disabled={!$selectedPersons.hasItems && $t`Select a contact first`}>
        {#each addressbookSections as section}
          <MenuLabel label={section.mainAccount?.name ?? $t`My Contacts`} />
          {#each section.addressbooks as addressbook (addressbook.id)}
            <MenuItem label={addressbook.name} icon={AddressbookIcon}
              disabled={selectionIsIn(addressbook)}
              onClick={() => Promise.all($selectedPersons.contents.map(contact => contact.moveToAddressbook(addressbook)))} />
          {/each}
        {/each}
        <MenuDivider />
        <SubMenu label={$t`Copy to Folder`} icon={CopyIcon} disabled={!hasPersons && $t`Select a contact first`}>
          {#each addressbookSections as section}
            <MenuLabel label={section.mainAccount?.name ?? $t`My Contacts`} />
            {#each section.addressbooks as addressbook (addressbook.id)}
              <MenuItem label={addressbook.name} icon={AddressbookIcon}
                disabled={selectionIsIn(addressbook)}
                onClick={() => ContactActions.copyTo($selectedPersons.contents, addressbook)} />
            {/each}
          {/each}
        </SubMenu>
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Find`}>
      <SearchPeopleBox onChoose={showContact} />
      <RibbonButton label={$t`Search Contacts`} icon={SearchIcon} size="small"
        onClick={focusSearch} shortCutInfo="Ctrl+E" />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Send / Receive`}>
    <RibbonGroup label={$t`Send & Receive`}>
      <RibbonButton label={$t`Update Folder`} shortLabel={$t`Update`} icon={SyncIcon}
        onClick={() => ContactActions.sync(selectedAddressbook)}
        disabled={!selectedAddressbook?.canSync && $t`Select an address book on a server first`} />
      <RibbonButton label={$t`Update All`} icon={SyncAllIcon}
        onClick={syncAll}
        disabled={!$addressbooks.some(addressbook => addressbook.canSync) && $t`None of your address books is on a server`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`Folder`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Folder`} icon={NewFolderIcon}
        tooltip={$t`Create a new address book on this computer`}
        onClick={() => SettingsDialogs.open({ kind: "new-folder-account", folderKind: "addressbook", localOnly: true })} />
    </RibbonGroup>
    <RibbonGroup label={$t`Actions`}>
      <RibbonButton label={$t`Rename Folder`} shortLabel={$t`Rename`} icon={RenameIcon}
        tooltip={$t`Rename Folder`}
        onClick={() => { renamingAddressbook = selectedAddressbook; }}
        disabled={!isWritableAddressbook && $t`Select an address book first`} />
      <RibbonButton label={$t`Delete Folder`} shortLabel={$t`Delete`} icon={DeleteIcon}
        tooltip={$t`Delete Folder`}
        onClick={() => ContactActions.deleteFolder(selectedAddressbook)}
        disabled={!(selectedAddressbook && $addressbooks.contains(selectedAddressbook) && !selectedAddressbook.mainAccount) && $t`Only address books that you added yourself can be removed here`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Properties`}>
      <RibbonButton label={$t`Folder Properties`} shortLabel={$t`Properties`} icon={PropertiesIcon}
        tooltip={$t`Folder Properties`}
        onClick={() => { propertiesAddressbook = selectedAddressbook; }}
        disabled={!selectedAddressbook && $t`Select an address book first`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`View`}>
    <RibbonGroup label={$t`Current View`}>
      <RibbonMenuButton label={$t`Change View`} shortLabel={$t`Views`} icon={ChangeViewIcon}>
        <ChangeViewGallery views={contactViews} currentView={$view.value} on:change={event => setView(event.detail)} />
      </RibbonMenuButton>
      <RibbonButton label={$t`View Settings`} shortLabel={$t`Settings`} icon={ViewSettingsIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}
        onClick={() => { isViewSettingsOpen = true; }} />
      <RibbonButton label={$t`Reset View`} icon={ResetViewIcon}
        tooltip={$t`Reset the view, the sort order and the panes to the default settings`}
        onClick={resetView} />
    </RibbonGroup>
    <RibbonGroup label={$t`Arrangement`}>
      <RibbonMenuButton label={$t`Arrange By`} shortLabel={$t`Arrange`} icon={ArrangeIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}>
        {#each arrangeColumns as column}
          <MenuItem label={ContactColumns.label(column)} checked={$sort.value.column == column}
            onClick={() => arrangeBy(column)} />
        {/each}
      </RibbonMenuButton>
      <RibbonButton label={$t`Reverse Sort`} icon={ReverseIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}
        onClick={reverseSort} />
      <RibbonButton label={$t`Add Columns`} shortLabel={$t`Columns`} icon={AddColumnsIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}
        onClick={() => { isShowColumnsOpen = true; }} />
    </RibbonGroup>
    <RibbonGroup label={$t`Layout`}>
      <RibbonMenuButton label={$t`Folder Pane`} shortLabel={$t`Folders`} icon={FolderPaneIcon}>
        <MenuItem label={$t`Normal`} checked={$folderPane.value != false} onClick={() => { $folderPane.value = true; }} />
        <MenuItem label={$t`Off`} checked={$folderPane.value == false} onClick={() => { $folderPane.value = false; }} />
      </RibbonMenuButton>
      <RibbonMenuButton label={$t`Reading Pane`} shortLabel={$t`Reading`} icon={ReadingPaneIcon}
        disabled={$view.value != ContactView.People && $view.value && $t`Available in the People view`}>
        <MenuItem label={$t`Right`} checked={$readingPane.value != false} onClick={() => { $readingPane.value = true; }} />
        <MenuItem label={$t`Off`} checked={$readingPane.value == false} onClick={() => { $readingPane.value = false; }} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonDisplayGroup />
  </RibbonTab>
  <slot />
</Ribbon>
{#if renamingAddressbook}
  <RenameDialog account={renamingAddressbook} title={$t`Rename Folder`} on:close={() => renamingAddressbook = null} />
{/if}
{#if propertiesAddressbook}
  <AddressBookPropertiesDialog addressbook={propertiesAddressbook} on:close={() => propertiesAddressbook = null} />
{/if}
{#if isViewSettingsOpen}
  <ViewSettingsDialog view={$view.value} on:close={() => isViewSettingsOpen = false} />
{/if}
{#if isShowColumnsOpen}
  <!-- <copied from="Person/PersonsTable.svelte"> -->
  <ShowColumnsDialog columns={ContactColumns.shownColumns($columnsSetting.value)}
    allColumns={ContactColumns.allColumns} labelOf={ContactColumns.label}
    requiredColumn={ContactColumn.FullName} requiredReason={$t`The list needs the Full Name column`}
    columnSets={ContactColumns.columnSets()}
    on:change={event => { $columnsSetting.value = ContactColumns.shownColumns(event.detail); }}
    on:close={() => isShowColumnsOpen = false} />
  <!-- </copied> -->
{/if}

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person, type ContactEntry } from "../../logic/Abstract/Person";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { contactSearchOptions } from "./Person/Selected";
  import { ContactSearch } from "./ContactSearch";
  import { contactSearchInput } from "./Search/ContactSearchBox.svelte";
  import { ContactActions } from "./ContactActions";
  import { SettingsDialogs } from "../Settings/SettingsDialogs";
  import { ContactColumn, ContactColumns, ContactView, type ContactSort } from "./Person/ContactColumns";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { AddressbookSections } from "./AddressbookSections";
  import { appGlobal } from "../../logic/app";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonDisplayGroup from "../Shared/Ribbon/RibbonDisplayGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../Shared/Menu/SubMenu.svelte";
  import ChangeViewGallery from "../Shared/Ribbon/ChangeViewGallery.svelte";
  import SearchPeopleBox from "./Search/SearchPeopleBox.svelte";
  import AddressBookPropertiesDialog from "./AddressBookPropertiesDialog.svelte";
  import ViewSettingsDialog from "./ViewSettings/ViewSettingsDialog.svelte";
  import ShowColumnsDialog from "../Shared/ViewSettings/ShowColumnsDialog.svelte";
  import RenameDialog from "../Settings/Shared/RenameDialog.svelte";
  import NewContactIcon from "lucide-svelte/icons/user-round-plus";
  import NewGroupIcon from "lucide-svelte/icons/users-round";
  import NewItemsIcon from "lucide-svelte/icons/file-plus-corner";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import MoreIcon from "lucide-svelte/icons/ellipsis";
  import CallIcon from "lucide-svelte/icons/phone";
  import ChangeViewIcon from "lucide-svelte/icons/layout-template";
  import PeopleViewIcon from "lucide-svelte/icons/contact-round";
  import BusinessCardViewIcon from "lucide-svelte/icons/id-card";
  import CardViewIcon from "lucide-svelte/icons/rows-3";
  import PhoneViewIcon from "lucide-svelte/icons/phone";
  import ListViewIcon from "lucide-svelte/icons/table-properties";
  import ResetViewIcon from "lucide-svelte/icons/rotate-ccw";
  import ViewSettingsIcon from "lucide-svelte/icons/sliders-horizontal";
  import AddColumnsIcon from "lucide-svelte/icons/columns-3";
  import ArrangeIcon from "lucide-svelte/icons/arrow-down-wide-narrow";
  import ReverseIcon from "lucide-svelte/icons/arrow-up-down";
  import FolderPaneIcon from "lucide-svelte/icons/panel-left";
  import ReadingPaneIcon from "lucide-svelte/icons/panel-right";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/copy";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import SearchIcon from "lucide-svelte/icons/search";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import SyncAllIcon from "lucide-svelte/icons/refresh-ccw-dot";
  import RenameIcon from "lucide-svelte/icons/pencil-line";
  import NewFolderIcon from "lucide-svelte/icons/folder-plus";
  import PropertiesIcon from "lucide-svelte/icons/file-cog";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let selectedAddressbook: Addressbook | null;
  export let selectedPersons: ArrayColl<Contact>;

  const addressbooks = appGlobal.addressbooks;
  $: addressbookSections = new AddressbookSections($addressbooks.contents).sections;
  $: isWritableAddressbook = !!selectedAddressbook && $addressbooks.contains(selectedAddressbook);
  const view = getLocalStorage<ContactView>("lookout.contacts.view", ContactView.People);
  let renamingAddressbook: Addressbook | null = null;
  let propertiesAddressbook: Addressbook | null = null;
  let isViewSettingsOpen = false;
  let isShowColumnsOpen = false;
  const sort = getLocalStorage<ContactSort>("lookout.contacts.sort", { column: ContactColumn.FullName, ascending: true });
  const folderPane = getLocalStorage<boolean>("lookout.contacts.folderPane", true);
  const readingPane = getLocalStorage<boolean>("lookout.contacts.readingPane", true);
  $: columnsSetting = getLocalStorage<ContactColumn[]>($view.value == ContactView.Phone ? "lookout.contacts.phone.columns" : "lookout.contacts.list.columns", ContactColumns.defaultColumns($view.value));
  const arrangeColumns = [ContactColumn.FullName, ContactColumn.Company, ContactColumn.JobTitle, ContactColumn.EMail];

  $: contactViews = [
    { id: ContactView.People, label: $t`People`, icon: PeopleViewIcon, tooltip: $t`Contacts with their profile card` },
    { id: ContactView.BusinessCard, label: $t`Business Card`, icon: BusinessCardViewIcon, tooltip: $t`Contacts as business cards` },
    { id: ContactView.Card, label: $t`Card`, icon: CardViewIcon, tooltip: $t`Contacts as address cards` },
    { id: ContactView.Phone, label: $t`Phone`, icon: PhoneViewIcon, tooltip: $t`Phone list` },
    { id: ContactView.List, label: $t`List`, icon: ListViewIcon, tooltip: $t`Contacts in a table` },
  ];
  $: isTableView = $view.value == ContactView.Phone || $view.value == ContactView.List;
  $: hasEmailAddress = ContactActions.hasEmailAddress($selectedPersons.contents);
  $: hasPersons = $selectedPersons.some(contact => contact instanceof Person);
  $: selectedPerson = $selectedPersons.length == 1 && $selectedPersons.first instanceof Person ? $selectedPersons.first as Person : null;
  $: phoneNumbers = selectedPerson ? selectedPerson.phoneNumbers.contents : [] as ContactEntry[];

  async function onDelete() {
    await ContactActions.deleteContacts(selectedPersons.contents);
  }

  // <copied from="ContactsAppD.svelte">
  function focusSearch() {
    $contactSearchInput?.focus();
    $contactSearchInput?.select();
  }
  // </copied>

  // <copied from="ContactsAppD.svelte">
  function closeSearch() {
    $contactSearchOptions = ContactSearch.defaultOptions($contactSearchOptions.scope);
  }
  // </copied>

  function showContact(contact: Contact) {
    closeSearch();
    ContactActions.show(contact);
  }

  function resetView() {
    view.value = ContactView.People;
    sort.value = sort.defaultValue;
    for (let tableView of [ContactView.List, ContactView.Phone]) {
      getLocalStorage<ContactColumn[]>(tableView == ContactView.Phone ? "lookout.contacts.phone.columns" : "lookout.contacts.list.columns", ContactColumns.defaultColumns(tableView)).value = ContactColumns.defaultColumns(tableView);
      getLocalStorage<ContactSort | null>(tableView == ContactView.Phone ? "lookout.contacts.phone.groupBy" : "lookout.contacts.list.groupBy", ContactColumns.defaultGroupBy(tableView)).value = ContactColumns.defaultGroupBy(tableView);
    }
    folderPane.value = true;
    readingPane.value = true;
  }

  function setView(newView: ContactView) {
    view.value = newView;
  }

  function selectionIsIn(addressbook: Addressbook): boolean {
    return selectedPersons.hasItems && selectedPersons.every(contact => contact.addressbook == addressbook);
  }

  function arrangeBy(column: ContactColumn) {
    sort.value = { column, ascending: true };
  }

  function reverseSort() {
    let current = sort.value;
    sort.value = { column: current.column, ascending: !current.ascending };
  }

  async function syncAll() {
    await Promise.all(addressbooks.contents
      .filter(addressbook => addressbook.canSync)
      .map(addressbook => ContactActions.sync(addressbook)));
  }
</script>
