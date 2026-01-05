<fieldset>
  <legend>{$t`Permissions`}</legend>
  <hbox>
    <vbox>
      <label>{$t`Read`}
        <select bind:value={person.exchangePermissions.ReadItems}>
          <option value=None>{$t`None`}</option>
          <option value=FullDetails>{$t`All`}</option>
        </select>
      </label>
      <label>{$t`Edit`}
        <select bind:value={person.exchangePermissions.EditItems}>
          <option value=None>{$t`None`}</option>
          <option value=Owned>{$t`Owned`}</option>
          <option value=All>{$t`All`}</option>
        </select>
      </label>
      <label>{$t`Delete`}
        <select bind:value={person.exchangePermissions.DeleteItems}>
          <option value=None>{$t`None`}</option>
          <option value=Owned>{$t`Owned`}</option>
          <option value=All>{$t`All`}</option>
        </select>
      </label>
    </vbox>
    <vbox>
      <label><input type=checkbox checked={person.exchangePermissions.CanCreateItems}/> {$t`Create`}</label>
      <label><input type=checkbox checked={person.exchangePermissions.CanCreateSubFolders}/> {$t`Create Subfolders`}</label>
      <label><input type=checkbox disabled={true} checked={person.exchangePermissions.IsFolderOwner}/> {$t`Owner`}</label>
    </vbox>
  </hbox>
</fieldset>

<script lang="ts">
  import { type ExchangePermission } from "../../../../logic/Mail/EWS/EWSFolder";
  import { t } from "../../../../l10n/l10n";

  export let person: ExchangePermission;
</script>
