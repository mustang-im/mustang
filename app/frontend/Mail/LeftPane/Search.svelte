<vbox flex class="search">
  <hbox class="header">Search</hbox>
  {#if $globalSearchTerm}
    <hbox class="term">
      for
      <SearchField bind:searchTerm={$globalSearchTerm} placeholder="Search for email content or subject" />
    </hbox>
  {/if}
  <vbox class="boolean-criteria">
    {#if selectedAccount}
      <Checkbox bind:checked={forAccount}
        label="In account {selectedAccount.name}" />
    {/if}
    {#if selectedFolder}
      <Checkbox bind:checked={forFolder}
        label="In folder {selectedFolder.name}" />
    {/if}
    <Checkbox bind:checked={forSent}
      label="Sent by me">
      <OutgoingIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={forUnread}
      label="Unread"
      classes="unread {forUnread ? "is-unread" : ""}">
      <CircleIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={forStar}
      label="Starred"
      classes="star {forStar ? "starred" : ""}">
      <StarIcon size="16px" slot="icon" />
    </Checkbox>
    <Checkbox bind:checked={forAttachment}
      label="Attachment">
      <AttachmentIcon size="16px" slot="icon" />
    </Checkbox>
    {#if forAttachment}
      <!--- TODO use Slider -->
      <grid class="size">
        <Checkbox bind:checked={minSizeEnabled}
          label="At least " />
        <input type="number" bind:value={minSizeMB}
          min={1} max={20} disabled={!minSizeEnabled} />
        MB
        <Checkbox bind:checked={maxSizeEnabled}
          label="Less than " />
        <input type="number" bind:value={maxSizeMB}
          min={1} max={20} maxlength="2" disabled={!maxSizeEnabled} />
        MB
      </grid>
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import Checkbox from "../../Shared/Checkbox.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import OutgoingIcon from "lucide-svelte/icons/arrow-big-left";
  import StarIcon from "lucide-svelte/icons/star";
  import CircleIcon from "lucide-svelte/icons/circle";
  import AttachmentIcon from "lucide-svelte/icons/paperclip";

  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */

  let forAccount = false;
  let forFolder = false;
  let forSent = false;
  let forUnread = false;
  let forStar = false;
  let forAttachment = false;
  let minSizeEnabled = false;
  let maxSizeEnabled = false;
  let minSizeMB: number | null = null;
  let maxSizeMB: number | null = null;

  $: if (!minSizeEnabled) minSizeMB = null;
  $: if (!maxSizeEnabled) maxSizeMB = null;
</script>

<style>
  .search {
    margin: 16px 24px;
  }
  .header {
    font-size: 20px;
    font-weight: bold;
  }
  .term {
    margin: 8px 0px;
    font-size: 16px;
    align-items: center;
  }
  .term :global(.search) {
    margin: 0px 8px;
  }
  .term :global(input) {
    font-size: 16px;
  }
  .boolean-criteria {
    margin: 16px 0px;
  }
  .search :global(.star.starred svg) {
    fill: orange;
  }
  .search :global(.unread.is-unread svg) {
    fill: green;
  }
  grid.size {
    margin: 4px 0px 8px 32px;
    grid-template-columns: max-content max-content max-content;
  }
  input {
    text-align: center;
    width: unset;
    margin: 0px 8px;
  }
  input[disabled] {
    background-color: unset;
    border-bottom: unset;
  }
</style>
