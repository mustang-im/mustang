{#if folder.specialFolder == SpecialFolder.Inbox}
  <InboxIcon {size} />
{:else if folder.specialFolder == SpecialFolder.Sent}
  <SentIcon {size} />
{:else if folder.specialFolder == SpecialFolder.Drafts}
  <DraftsIcon {size} />
{:else if folder.specialFolder == SpecialFolder.Trash}
  <TrashIcon {size} />
{:else if folder.specialFolder == SpecialFolder.Spam}
  <SpamIcon {size} />
{:else if folder.specialFolder == SpecialFolder.Archive}
  <ArchiveIcon {size} />
{:else if folder.specialFolder == SpecialFolder.All}
  <AllFoldersIcon {size} />
{:else}
  <FolderIcon {size} />
{/if}

<script lang="ts">
  import { SpecialFolder, type Folder } from '../../../logic/Mail/Folder';
  import FolderIcon from "lucide-svelte/icons/folder";
  import InboxIcon from "lucide-svelte/icons/inbox";
  import SentIcon from "lucide-svelte/icons/send";
  import DraftsIcon from "lucide-svelte/icons/pen-square";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import AllFoldersIcon from "lucide-svelte/icons/wallet-cards";

  export let folder: Folder;
  export let size = "16px";
</script>
