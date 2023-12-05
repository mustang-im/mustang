<vbox flex class="folder-list">
  <FastList items={folders} bind:selectedItem={selectedFolder}>
    <svelte:fragment slot="header">
      <hbox>Folders</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={folder}>
      <td>
        <hbox class="folder">
          <hbox class="icon">
            {#if folder.specialFolder == "inbox"}
              <InboxIcon size="14px" />
            {:else if folder.specialFolder == "sent"}
              <SentIcon size="14px" />
            {:else if folder.specialFolder == "drafts"}
              <DraftsIcon size="14px" />
            {:else if folder.specialFolder == "trash"}
              <TrashIcon size="14px" />
            {:else if folder.specialFolder == "spam"}
              <SpamIcon size="14px" />
            {:else if folder.specialFolder == "archive"}
              <ArchiveIcon size="14px" />
            {:else}
              <FolderIcon size="14px" />
            {/if}
          </hbox>
          <hbox class="label">{folder.name}</hbox>          
        </hbox>
      </td>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  //import type { MsgFolder } from "mustang-lib";
  import type { Folder } from '../../../logic/Mail/Folder';
  import type { Collection } from 'svelte-collections';
  import FastList from "../../Shared/FastList.svelte";
  import FolderIcon from "lucide-svelte/icons/folder";
  import InboxIcon from "lucide-svelte/icons/inbox";
  import SentIcon from "lucide-svelte/icons/send";
  import DraftsIcon from "lucide-svelte/icons/pen-square";
  import TrashIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import ArchiveIcon from "lucide-svelte/icons/archive";

  export let folders: Collection<Folder>;
  export let selectedFolder: Folder; /* in/out */
</script>

<style>
  .folder-list :global(.fast-list thead tr hbox) {
    background-color: transparent;
  }
  .folder-list :global(.fast-list tbody tr hbox) {
    font-size: 14px;
  }
  .folder {
    align-items: baseline;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    margin-left: 8px;
  }
</style>
