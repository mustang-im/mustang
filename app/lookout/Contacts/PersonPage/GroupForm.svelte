<vbox flex class="group-form-page" bind:this={pageEl}>
  <Ribbon>
    <RibbonTab label={$t`Contact Group`}>
      <RibbonGroup label={$t`Actions`}>
        <RibbonButton label={$t`Save & Close`} icon={SaveCloseIcon}
          onClick={saveAndClose} shortCutInfo="Alt+S" />
        <RibbonButton label={$t`Delete Group`} icon={DeleteIcon}
          onClick={deleteIt} />
      </RibbonGroup>
      <RibbonGroup label={$t`Show`}>
        <RibbonToggleButton label={$t`Members`} icon={MembersIcon} isRadio
          checked={page == "members"} onChange={() => { page = "members"; }} />
        <RibbonToggleButton label={$t`Notes`} icon={NotesIcon} isRadio
          checked={page == "notes"} onChange={() => { page = "notes"; }} />
      </RibbonGroup>
      <RibbonGroup label={$t`Members`}>
        <RibbonMenuButton label={$t`Add Members`} icon={AddMembersIcon}>
          <MenuItem label={$t`From Contacts…`} icon={ContactsIcon} onClick={() => openSelectMembers()} />
          <MenuItem label={$t`From Address Book…`} icon={AddressbookIcon} onClick={() => openSelectMembers()} />
          <MenuItem label={$t`New E-mail Contact…`} icon={NewContactIcon} onClick={() => { isNewContactOpen = true; }} />
        </RibbonMenuButton>
        <RibbonButton label={$t`Remove Member`} icon={RemoveIcon}
          disabled={!selectedMember && $t`Select a member first`}
          onClick={removeSelected} />
      </RibbonGroup>
      <RibbonGroup label={$t`Communicate`}>
        <RibbonButton label={$t`Email`} icon={MailIcon}
          onClick={() => ContactActions.writeMail([group])}
          disabled={!hasEmailAddress && $t`Add members with an email address first`} />
        <RibbonButton label={$t`Meeting`} icon={MeetingIcon}
          onClick={() => ContactActions.newMeeting([group])}
          disabled={!hasEmailAddress && $t`Add members with an email address first`} />
      </RibbonGroup>
    </RibbonTab>
  </Ribbon>

  <FormCard title={$group.name || $t`Untitled`} kind={$t`Contact Group`}>
    <vbox flex class="form-body">
      <hbox class="name-row">
        <label for="group-name">{$t`Name`}</label>
        <input id="group-name" type="text" class="lo-text-field" bind:value={group.name} bind:this={nameInput} />
      </hbox>
      {#if page == "notes"}
        <textarea class="lo-text-field notes" bind:value={group.description} aria-label={$t`Notes`} />
      {:else}
        <ListView items={sortedMembers} columns={memberColumns} bind:selected={selectedMember}
          label={$t`Members`} height="auto" classes="members"
          onOpen={member => ContactActions.edit(member)} let:item>
          <hbox class="cell name">
            <PersonPicture contact={item} size={20} />
            <span class="text">{item.name || ""}</span>
          </hbox>
          <span class="cell text">{PreferredEntry.valueOf(item.emailAddresses) ?? ""}</span>
          <svelte:fragment slot="empty">{$t`Use Add Members to add people to this group.`}</svelte:fragment>
        </ListView>
      {/if}
    </vbox>
  </FormCard>
</vbox>

{#if memberPicks}
  <SelectNamesDialog title={$t`Select Members: Contacts`} persons={memberPicks} label={$t`Members`}
    on:ok={onMembersPicked} on:close={() => { memberPicks = null; }} />
{/if}
{#if isNewContactOpen}
  <NewEMailContactDialog onAdd={addNewContact} on:close={() => { isNewContactOpen = false; }} />
{/if}

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Group } from "../../../logic/Abstract/Group";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { ContactActions } from "../ContactActions";
  import { catchErrors } from "../../../frontend/Util/error";
  import { Keyboard } from "../../Util/keyboard";
  import Ribbon from "../../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import ListView from "../../Shared/Form/ListView.svelte";
  import PersonPicture from "../Person/PersonPicture.svelte";
  import SelectNamesDialog from "../../Mail/Composer/SelectNamesDialog.svelte";
  import NewEMailContactDialog from "../NewEMailContactDialog.svelte";
  import { PreferredEntry } from "../PreferredEntry";
  import { LetterIndex } from "../LetterIndex";
  import type { Person } from "../../../logic/Abstract/Person";
  import FormCard from "./FormCard.svelte";
  import SaveCloseIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import AddMembersIcon from "lucide-svelte/icons/user-round-plus";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import ContactsIcon from "lucide-svelte/icons/contact-round";
  import NewContactIcon from "lucide-svelte/icons/mail-plus";
  import MembersIcon from "lucide-svelte/icons/users-round";
  import NotesIcon from "lucide-svelte/icons/notebook-pen";
  import RemoveIcon from "lucide-svelte/icons/user-round-minus";
  import { UserError } from "../../../logic/util/util";
  import { onMount, tick } from "svelte";
  import { ArrayColl } from "svelte-collections";
  import { gt, t } from "../../../l10n/l10n";

  export let group: Group;

  let nameInput: HTMLInputElement;
  let page: "members" | "notes" = "members";
  let selectedMember: Person = null;
  let memberPicks: ArrayColl<PersonUID> = null;
  let isNewContactOpen = false;

  $: members = group.participants;
  $: sortedMembers = [...$members.contents].sort(LetterIndex.compareByName);
  $: memberColumns = [ { label: $t`Name`, width: "minmax(0, 1fr)" }, { label: $t`E-mail`, width: "minmax(0, 1fr)" } ];
  $: hasEmailAddress = ContactActions.hasEmailAddress([$group]) && $members.hasItems;

  onMount(async () => {
    await tick();
    if (!group.name) {
      nameInput?.focus();
    }
  });

  function addMember(personUID: PersonUID) {
    let person = personUID.person ?? personUID.findPerson();
    if (!person) {
      throw new UserError(gt`Only people from your address books can be group members. Please add ${personUID.emailAddress} to your contacts first.`);
    }
    if (!group.participants.contains(person)) {
      group.participants.add(person);
    }
  }

  function openSelectMembers() {
    memberPicks = new ArrayColl<PersonUID>();
  }

  function onMembersPicked() {
    let picks = memberPicks.contents;
    memberPicks = null;
    for (let pick of picks) {
      addMember(pick);
    }
  }

  async function addNewContact(name: string, emailAddress: string) {
    let person = await ContactActions.createEMailContact(group.addressbook, name, emailAddress);
    group.participants.add(person);
  }

  function removeSelected() {
    group.participants.remove(selectedMember);
    selectedMember = null;
  }

  async function save() {
    if (!group.addressbook.groups.contains(group)) {
      group.addressbook.groups.add(group);
    }
    await group.save();
  }

  async function saveAndClose() {
    await save();
    ContactActions.closeForm(group);
  }

  async function deleteIt() {
    if (await ContactActions.deleteContacts([group])) {
      ContactActions.closeForm(null);
    }
  }

  let pageEl: HTMLElement;
  function onKeyDown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;
    if (!pageEl?.contains(target) && target != document.body) {
      return;
    }
    if (event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() == "s") {
      event.preventDefault();
      catchErrors(save);
    } else if (event.altKey && !event.ctrlKey && !event.shiftKey && event.code == "KeyS" && !Keyboard.isMac) {
      event.preventDefault();
      catchErrors(saveAndClose);
    }
  }
</script>

<style>
  .group-form-page {
    min-height: 0;
  }
  .form-body {
    min-height: 0;
    gap: 12px;
    padding: 16px 24px 24px 24px;
  }
  .name-row {
    align-items: center;
    gap: 12px;
    max-width: 720px;
  }
  .name-row input {
    flex: 1;
  }
  label {
    color: var(--lo-fg-secondary);
  }
  .form-body :global(.members) {
    flex: 1 1 0;
    min-height: 120px;
  }
  .cell {
    min-width: 0;
    padding: 4px 8px;
  }
  .cell.name {
    align-items: center;
    gap: 8px;
  }
  .text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .notes {
    flex: 1 1 0;
    min-height: 200px;
    resize: none;
  }
</style>
