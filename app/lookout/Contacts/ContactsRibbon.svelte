<Ribbon>
  <RibbonTab label={$t`Home`}>
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Contact`} icon={NewContactIcon}
        onClick={() => ContactActions.newContact($selectedAddressbook)}
        shortCutInfo="Ctrl+N" />
      <RibbonButton label={isSimplified ? $t`New Group` : $t`New Contact Group`} icon={NewGroupIcon}
        onClick={() => ContactActions.newGroup($selectedAddressbook)}
        shortCutInfo="Ctrl+Shift+L" />
      <RibbonMenuButton label={$t`New Items`} icon={NewItemsIcon}>
        <MenuItem label={$t`Contact`} icon={NewContactIcon}
          onClick={() => ContactActions.newContact($selectedAddressbook)} />
        <MenuItem label={$t`Contact Group`} icon={NewGroupIcon}
          onClick={() => ContactActions.newGroup($selectedAddressbook)} />
        <MenuDivider />
        <MenuItem label={$t`E-mail Message`} icon={MailIcon}
          onClick={() => ContactActions.writeMail($selectedContacts.contents)} />
        <MenuItem label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting($selectedContacts.contents)} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Delete`}>
      <RibbonButton label={$t`Delete`} icon={DeleteIcon}
        onClick={onDelete}
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
      <RibbonMenuButton label={$t`Change View`} icon={ChangeViewIcon}>
        <ChangeViewGallery views={contactViews} currentView={$view.value} onChange={setView} />
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Actions`}>
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
        <MenuDivider />
        <SubMenu label={$t`Copy to Folder`} icon={CopyIcon} disabled={!hasPersons && $t`Select a contact first`}>
          {#each addressbookSections as section}
            <MenuLabel label={section.mainAccount?.name ?? $t`My Contacts`} />
            {#each section.addressbooks as addressbook (addressbook.id)}
              <MenuItem label={addressbook.name} icon={AddressbookIcon}
                disabled={selectionIsIn(addressbook)}
                onClick={() => ContactActions.copyTo($selectedContacts.contents, addressbook)} />
            {/each}
          {/each}
        </SubMenu>
      </RibbonMenuButton>
    </RibbonGroup>
    <RibbonGroup label={$t`Find`}>
      <SearchPeopleBox onChoose={onShowContact} />
      <RibbonButton label={$t`Search Contacts`} icon={SearchIcon} size="small"
        onClick={onSearch} shortCutInfo="Ctrl+E" />
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
    <RibbonGroup label={$t`New`}>
      <RibbonButton label={$t`New Folder`} icon={NewFolderIcon}
        tooltip={$t`Create a new address book on this computer`}
        onClick={() => ContactActions.newFolder()} />
    </RibbonGroup>
    <RibbonGroup label={$t`Actions`}>
      <RibbonButton label={isSimplified ? $t`Rename` : $t`Rename Folder`} icon={RenameIcon}
        tooltip={$t`Rename Folder`}
        onClick={() => ContactActions.rename($selectedAddressbook)}
        disabled={!isWritableAddressbook && $t`Select an address book first`} />
      <RibbonButton label={isSimplified ? $t`Delete` : $t`Delete Folder`} icon={DeleteIcon}
        tooltip={$t`Delete Folder`}
        onClick={() => ContactActions.deleteFolder($selectedAddressbook)}
        disabled={!ContactActions.canDeleteFolder($selectedAddressbook) && $t`Only address books that you added yourself can be removed here`} />
    </RibbonGroup>
    <RibbonGroup label={$t`Properties`}>
      <RibbonButton label={isSimplified ? $t`Properties` : $t`Folder Properties`} icon={PropertiesIcon}
        tooltip={$t`Folder Properties`}
        onClick={() => ContactActions.openProperties($selectedAddressbook)}
        disabled={!$selectedAddressbook && $t`Select an address book first`} />
    </RibbonGroup>
  </RibbonTab>
  <RibbonTab label={$t`View`}>
    <RibbonGroup label={$t`Current View`}>
      <RibbonMenuButton label={$t`Change View`} icon={ChangeViewIcon}>
        <ChangeViewGallery views={contactViews} currentView={$view.value} onChange={setView} />
      </RibbonMenuButton>
      <RibbonButton label={$t`Reset View`} icon={ResetViewIcon}
        tooltip={$t`Reset the view, the sort order and the panes to the default settings`}
        onClick={resetView} />
    </RibbonGroup>
    <RibbonGroup label={$t`Arrangement`}>
      <RibbonMenuButton label={$t`Arrange By`} icon={ArrangeIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}>
        {#each arrangeColumns as column}
          <MenuItem label={ContactColumns.label(column)} checked={$sort.value.column == column}
            onClick={() => arrangeBy(column)} />
        {/each}
      </RibbonMenuButton>
      <RibbonButton label={$t`Reverse Sort`} icon={ReverseIcon}
        disabled={!isTableView && $t`Available in the Phone and List views`}
        onClick={reverseSort} />
    </RibbonGroup>
    <RibbonGroup label={$t`Layout`}>
      <RibbonMenuButton label={$t`Folder Pane`} icon={FolderPaneIcon}>
        <MenuItem label={$t`Normal`} checked={$folderPane.value != false} onClick={() => { $folderPane.value = true; }} />
        <MenuItem label={$t`Off`} checked={$folderPane.value == false} onClick={() => { $folderPane.value = false; }} />
      </RibbonMenuButton>
      <RibbonMenuButton label={$t`Reading Pane`} icon={ReadingPaneIcon}
        disabled={$view.value != ContactView.People && $view.value && $t`Available in the People view`}>
        <MenuItem label={$t`Right`} checked={$readingPane.value != false} onClick={() => { $readingPane.value = true; }} />
        <MenuItem label={$t`Off`} checked={$readingPane.value == false} onClick={() => { $readingPane.value = false; }} />
      </RibbonMenuButton>
    </RibbonGroup>
  </RibbonTab>
  <slot />
</Ribbon>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person, type ContactEntry } from "../../logic/Abstract/Person";
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { selectedAddressbook } from "./Selected";
  import { ContactActions } from "./ContactActions";
  import { ContactColumn, ContactColumns, ContactView } from "./Views/ContactColumns";
  import type { AddressbookSection } from "./AddressbookSections";
  import { appGlobal } from "../../logic/app";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import RibbonMenuButton from "../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../Shared/Menu/SubMenu.svelte";
  import ChangeViewGallery from "../Calendar/View/ChangeViewGallery.svelte";
  import SearchPeopleBox from "./SearchPeopleBox.svelte";
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
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import type { RibbonLayout } from "../Shared/Ribbon/Ribbon";
  import { t } from "../../l10n/l10n";

  export let selectedContacts: ArrayColl<Contact>;
  export let addressbookSections: AddressbookSection[];
  export let isWritableAddressbook: boolean;
  export let onDelete: () => Promise<void>;
  export let onSearch: () => void;
  export let onShowContact: (contact: Contact) => void;
  export let resetView: () => void;

  const addressbooks = appGlobal.addressbooks;
  const ribbonLayout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  $: isSimplified = $ribbonLayout.value == "simplified";
  const view = ContactColumns.view;
  const sort = ContactColumns.sort;
  const folderPane = ContactColumns.folderPane;
  const readingPane = ContactColumns.readingPane;
  const arrangeColumns = [ContactColumn.FullName, ContactColumn.Company, ContactColumn.JobTitle, ContactColumn.EMail];

  $: contactViews = [
    { id: ContactView.People, label: $t`People`, icon: PeopleViewIcon, tooltip: $t`Contacts with their profile card` },
    { id: ContactView.BusinessCard, label: $t`Business Card`, icon: BusinessCardViewIcon, tooltip: $t`Contacts as business cards` },
    { id: ContactView.Card, label: $t`Card`, icon: CardViewIcon, tooltip: $t`Contacts as address cards` },
    { id: ContactView.Phone, label: $t`Phone`, icon: PhoneViewIcon, tooltip: $t`Phone list` },
    { id: ContactView.List, label: $t`List`, icon: ListViewIcon, tooltip: $t`Contacts in a table` },
  ];
  $: isTableView = $view.value == ContactView.Phone || $view.value == ContactView.List;
  $: hasEmailAddress = ContactActions.hasEmailAddress($selectedContacts.contents);
  $: hasPersons = $selectedContacts.some(contact => contact instanceof Person);
  $: selectedPerson = $selectedContacts.length == 1 && $selectedContacts.first instanceof Person ? $selectedContacts.first as Person : null;
  $: phoneNumbers = selectedPerson ? selectedPerson.phoneNumbers.contents : [] as ContactEntry[];

  function setView(newView: ContactView) {
    ContactColumns.view.value = newView;
  }

  function selectionIsIn(addressbook: Addressbook): boolean {
    return selectedContacts.hasItems && selectedContacts.every(contact => contact.addressbook == addressbook);
  }

  function arrangeBy(column: ContactColumn) {
    ContactColumns.sort.value = { column, ascending: true };
  }

  function reverseSort() {
    let current = ContactColumns.sort.value;
    ContactColumns.sort.value = { column: current.column, ascending: !current.ascending };
  }

  async function syncAll() {
    await Promise.all(addressbooks.contents
      .filter(addressbook => addressbook.canSync)
      .map(addressbook => ContactActions.sync(addressbook)));
  }
</script>
