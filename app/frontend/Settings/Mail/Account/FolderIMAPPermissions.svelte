<fieldset>
  <legend>{$t`Permissions`}</legend>
  <hbox>
    <vbox>
      <label><input type=checkbox on:click={() => setPermission("l")} bind:checked={person.lookup}/> {$t`Look up`}</label>
      <label><input type=checkbox on:click={() => setPermission("r")} bind:checked={person.read}/> {$t`Read`}</label>
      <label><input type=checkbox on:click={() => setPermission("s")} bind:checked={person.seen}/> {$t`Mark Read`}</label>
      <label><input type=checkbox on:click={() => setPermission("w")} bind:checked={person.write}/> {$t`Flag`}</label>
      <label><input type=checkbox on:click={() => setPermission("i")} bind:checked={person.create}/> {$t`Create`}</label>
    </vbox>
    <vbox>
      <label><input type=checkbox on:click={() => setPermission("k")} bind:checked={person.lookup}/> {$t`New Subfolder`}</label>
      <label><input type=checkbox on:click={() => setPermission("x")} bind:checked={person.read}/> {$t`Remove Folder`}</label>
      <label><input type=checkbox on:click={() => setPermission("t")} bind:checked={person.seen}/> {$t`Delete Messages`}</label>
      <label><input type=checkbox on:click={() => setPermission("e")} bind:checked={person.write}/> {$t`Expunge`}</label>
      <label><input type=checkbox disabled={true} checked={person.owner}/> {$t`Owner`}</label>
    </vbox>
  </hbox>
</fieldset>

<script lang="ts">
  import { IMAPFolder, type IMAPPermission, type IMAPACL } from "../../../../logic/Mail/IMAP/IMAPFolder";
  import { t } from "../../../../l10n/l10n";

  export let folder: IMAPFolder;
  export let person: IMAPPermission;

  function setPermission(right: keyof typeof IMAPACL) {
    folder.setPermission(person, right);
  }
</script>
