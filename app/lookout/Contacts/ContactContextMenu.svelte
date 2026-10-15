<ContextMenu bind:this={contextMenu}>
  {#if contacts.length == 1}
    <MenuItem
      label={$t`Open`}
      icon={OpenIcon}
      onClick={() => ContactActions.edit(contacts[0])} />
  {/if}
  {#if hasEmailAddress}
    <MenuItem
      label={$t`Email`}
      icon={MailIcon}
      onClick={() => ContactActions.writeMail(contacts)} />
    <MenuItem
      label={$t`Meeting`}
      icon={MeetingIcon}
      onClick={() => ContactActions.newMeeting(contacts)} />
  {/if}
  {#if contacts.length == 1 && contacts[0] instanceof Person}
    <MenuItem
      label={$t`Copy contact`}
      tooltip={$t`Copy the contact information to the clipboard`}
      icon={CopyIcon}
      onClick={() => ContactActions.copyToClipboard(contacts[0] as Person)} />
  {/if}
  <MenuDivider />
  <MenuItem
    label={$t`Delete`}
    icon={DeleteIcon}
    shortCutInfo="Del"
    onClick={() => ContactActions.deleteContacts(contacts)} />
</ContextMenu>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { Person } from "../../logic/Abstract/Person";
  import { ContactActions } from "./ContactActions";
  import ContextMenu from "../../frontend/Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../frontend/Shared/Menu/MenuDivider.svelte";
  import OpenIcon from "lucide-svelte/icons/square-pen";
  import MailIcon from "lucide-svelte/icons/mail";
  import MeetingIcon from "lucide-svelte/icons/calendar-plus";
  import CopyIcon from "lucide-svelte/icons/copy";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import type { ArrayColl } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  let contextMenu: ContextMenu;
  let contacts: Contact[] = [];

  $: hasEmailAddress = ContactActions.hasEmailAddress(contacts);

  export function openFor(event: MouseEvent, contact: Contact, selectedContacts: ArrayColl<Contact>) {
    event.preventDefault();
    if (!selectedContacts.contains(contact)) {
      selectedContacts.clear();
      selectedContacts.add(contact);
    }
    contacts = selectedContacts.contents;
    contextMenu.onContextMenu(event);
  }
</script>
