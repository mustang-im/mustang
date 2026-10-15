<vbox flex class="group-form-page" bind:this={pageEl}>
  <Ribbon>
    <RibbonTab label={$t`Contact Group`}>
      <RibbonGroup label={$t`Actions`}>
        <RibbonButton label={$t`Save & Close`} icon={SaveCloseIcon}
          onClick={saveAndClose} shortCutInfo="Alt+S" />
        <RibbonButton label={$t`Delete Group`} icon={DeleteIcon}
          onClick={deleteIt} />
      </RibbonGroup>
      <RibbonGroup label={$t`Members`}>
        <RibbonButton label={$t`Add Members`} icon={AddMembersIcon}
          onClick={focusAddMember} />
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
    <hbox slot="title-end" class="addressbook lo-secondary">
      <AddressbookIcon size={16} />
      {$group.addressbook?.name ?? ""}
    </hbox>

    <vbox flex class="form-body">
      <grid class="fields">
        <label for="group-name">{$t`Name`}</label>
        <input id="group-name" type="text" bind:value={group.name} bind:this={nameInput} />
        <label for="group-description">{$t`Description`}</label>
        <input id="group-description" type="text" bind:value={group.description} />
      </grid>

      <h2>{$t`Members`} <span class="count">{$members.length}</span></h2>
      <hbox class="add-member" bind:this={addMemberEl}>
        <PersonAutocomplete
          onAddPerson={addMember}
          skipPersonFunc={isMember}
          placeholder={$t`Add members by name or email address`} />
      </hbox>
      <vbox class="members">
        {#each $members.each as member (member.id)}
          <GroupMemberLine person={member}>
            <button class="remove" on:click={() => group.participants.remove(member)}
              title={$t`Remove Member`}>
              <RemoveIcon size={14} />
            </button>
          </GroupMemberLine>
        {:else}
          <hbox class="no-members">{$t`This group has no members yet.`}</hbox>
        {/each}
      </vbox>
    </vbox>
  </FormCard>
</vbox>

<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
  import type { Group } from "../../logic/Abstract/Group";
  import type { PersonUID } from "../../logic/Abstract/PersonUID";
  import { ContactActions } from "./ContactActions";
  import { catchErrors } from "../../frontend/Util/error";
  import Ribbon from "../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../Shared/Ribbon/RibbonButton.svelte";
  import GroupMemberLine from "./GroupMemberLine.svelte";
  import FormCard from "./FormCard.svelte";
  import PersonAutocomplete from "../../frontend/Contacts/PersonAutocomplete/PersonAutocomplete.svelte";
  import SaveCloseIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import AddMembersIcon from "lucide-svelte/icons/user-round-plus";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import RemoveIcon from "lucide-svelte/icons/x";
  import { UserError } from "../../logic/util/util";
  import { onMount, tick } from "svelte";
  import { gt, t } from "../../l10n/l10n";

  export let group: Group;

  let nameInput: HTMLInputElement;
  let addMemberEl: HTMLElement;

  $: members = group.participants;
  $: hasEmailAddress = ContactActions.hasEmailAddress([$group]) && $members.hasItems;

  onMount(async () => {
    await tick();
    if (!group.name) {
      nameInput?.focus();
    }
  });

  function isMember(personUID: PersonUID): boolean {
    return group.participants.contents.some(member =>
      member.emailAddresses.some(entry => entry.value == personUID.emailAddress));
  }

  function addMember(personUID: PersonUID) {
    let person = personUID.person ?? personUID.findPerson();
    if (!person) {
      throw new UserError(gt`Only people from your address books can be group members. Please add ${personUID.emailAddress} to your contacts first.`);
    }
    group.participants.add(person);
  }

  function focusAddMember() {
    addMemberEl?.querySelector("input")?.focus();
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
    } else if (event.altKey && !event.ctrlKey && !event.shiftKey && event.key.toLowerCase() == "s") {
      event.preventDefault();
      catchErrors(saveAndClose);
    }
  }
</script>

<style>
  .group-form-page {
    min-height: 0;
  }
  .addressbook {
    align-items: center;
    gap: 6px;
  }
  .form-body {
    min-height: 0;
    max-width: 720px;
    overflow-y: auto;
    padding: 16px 24px 24px 24px;
  }
  grid.fields {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 6px 12px;
  }
  label {
    color: var(--lo-fg-secondary);
  }
  h2 {
    margin: 24px 0 8px 0;
    padding-block-end: 4px;
    border-block-end: 1px solid var(--lo-divider);
    font-size: var(--lo-font-size);
    font-weight: 600;
  }
  .count {
    margin-inline-start: 4px;
    font-weight: normal;
    color: var(--lo-fg-secondary);
  }
  .add-member {
    margin-block-end: 8px;
  }
  .add-member :global(.person-autocomplete) {
    height: 32px;
  }
  .add-member :global(.person-autocomplete .autocomplete),
  .add-member :global(.person-autocomplete .input-container),
  .add-member :global(.person-autocomplete input) {
    width: 100%;
  }
  .add-member :global(.person-autocomplete input) {
    border: 1px solid var(--lo-input-border) !important;
    border-radius: var(--lo-radius-small) !important;
    box-shadow: none !important;
    background-color: var(--lo-input-bg) !important;
    font: inherit;
  }
  .add-member :global(.person-autocomplete input:focus) {
    outline: none;
    border-color: var(--lo-accent) !important;
  }
  .remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .remove:hover {
    background-color: var(--lo-pressed-bg);
    color: var(--lo-danger);
  }
  .no-members {
    margin: 8px;
    color: var(--lo-fg-secondary);
  }
</style>
