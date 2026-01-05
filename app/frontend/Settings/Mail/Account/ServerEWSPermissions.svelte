<fieldset>
  <legend>{$t`Permissions`}</legend>
  <grid>
    <span>{$t`Inbox:`}</span> <ServerEWSPermission bind:value={person.inboxPermission}/>
    <span>{$t`Address book:`}</span> <ServerEWSPermission bind:value={person.addressbookPermission}/>
    <span>{$t`Calendar:`}</span> <ServerEWSPermission bind:value={person.calendarPermission}/>
  </grid>
</fieldset>

<script lang="ts">
  import type { Delegate } from "../../../../logic/Mail/EWS/EWSAccount";
  import ServerEWSPermission from "./ServerEWSPermission.svelte";
  import { t } from "../../../../l10n/l10n";

  export let person: Delegate;
</script>

<style>
  grid {
    grid-template-columns: max-content max-content;
  }
</style>
