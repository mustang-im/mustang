<vbox flex class="folder-list">
  <FastList items={folders} bind:selectedItem={selectedFolder} columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Folders</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={folder}>
      <hbox class="folder" on:drop={(event) => catchErrors(() => onDropMail(event, folder))} on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}>
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
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
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
  import { catchErrors } from '../../Util/error';
  import { onDropMail, onDragOverMail } from '../Message/drag';

  export let folders: Collection<Folder>;
  export let selectedFolder: Folder; /* in/out */
</script>

<style>
  .folder-list :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-left: 10px !important;
    color: grey;
    font-size: 12px;
  }
  .folder {
    align-items: center;
    padding-left: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    padding-left: 8px;
  }
</style>
