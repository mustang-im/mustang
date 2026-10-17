<vbox class="open-export-page">
  <h1>{$t`Open`}</h1>
  <vbox class="commands">
    <button class="command" disabled={!sharingAccounts.length}
      title={sharingAccounts.length ? null : $t`None of your accounts can open the calendars of colleagues`}
      on:click={() => CalendarActions.openSharedCalendar(null)}>
      <hbox class="command-icon"><OpenCalendarIcon size={32} strokeWidth={1.25} /></hbox>
      <vbox class="command-text">
        <span class="command-title">{$t`Open Calendar`}</span>
        <span class="command-description">{$t`Open a calendar that a colleague shared with you.`}</span>
      </vbox>
    </button>
    <button class="command" on:click={() => SettingsDialogs.open({ kind: "import-export" })}>
      <hbox class="command-icon"><ImportExportIcon size={32} strokeWidth={1.25} /></hbox>
      <vbox class="command-text">
        <span class="command-title">{$t`Import/Export`}</span>
        <span class="command-description">{$t`Import or export files and settings.`}</span>
      </vbox>
    </button>
    <button class="command" disabled={!mailAccount}
      on:click={() => isSharedFolderOpen = true}>
      <hbox class="command-icon"><SharedFolderIcon size={32} strokeWidth={1.25} /></hbox>
      <vbox class="command-text">
        <span class="command-title">{$t`Other User's Folder`}</span>
        <span class="command-description">{$t`Open a folder shared by another user.`}</span>
      </vbox>
    </button>
  </vbox>
</vbox>

{#if isSharedFolderOpen && mailAccount}
  <SharedFolderDialog account={mailAccount} on:close={() => isSharedFolderOpen = false} />
{/if}

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import { SettingsDialogs } from "../SettingsDialogs";
  import { selectedAccount } from "../../../frontend/Mail/Selected";
  import { CalendarActions } from "../../Calendar/CalendarActions";
  import { SharedCalendars } from "../../Calendar/Dialogs/SharedCalendars";
  import SharedFolderDialog from "../../Mail/LeftPane/SharedFolderDialog.svelte";
  import OpenCalendarIcon from "lucide-svelte/icons/calendar-search";
  import ImportExportIcon from "lucide-svelte/icons/arrow-left-right";
  import SharedFolderIcon from "lucide-svelte/icons/folder-symlink";
  import { t } from "../../../l10n/l10n";

  const emailAccounts = appGlobal.emailAccounts;
  let isSharedFolderOpen = false;
  let sharingAccounts = SharedCalendars.accounts();
  $: $emailAccounts, sharingAccounts = SharedCalendars.accounts();
  $: mailAccount = $selectedAccount && $emailAccounts.contains($selectedAccount)
    ? $selectedAccount
    : $emailAccounts.first;
</script>

<style>
  .open-export-page {
    max-width: 760px;
    padding: 24px 40px;
  }
  h1 {
    margin: 0 0 16px 0;
    font-size: 28px;
    font-weight: 300;
  }
  .commands {
    gap: 4px;
  }
  .command {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    min-height: 64px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .command:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
  }
  .command:active:not(:disabled) {
    background-color: var(--lo-pressed-bg);
  }
  .command:disabled {
    color: var(--lo-fg-disabled);
    cursor: default;
  }
  .command-icon {
    flex-shrink: 0;
    width: 40px;
    justify-content: center;
    color: var(--lo-accent-text);
  }
  .command:disabled .command-icon,
  .command:disabled .command-description {
    color: var(--lo-fg-disabled);
  }
  .command-text {
    gap: 2px;
  }
  .command-title {
    font-size: 16px;
    font-weight: 600;
  }
  .command-description {
    color: var(--lo-fg-secondary);
  }
</style>
