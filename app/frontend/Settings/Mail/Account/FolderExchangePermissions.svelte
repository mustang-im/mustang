<fieldset>
  <legend>{$t`Permissions`}</legend>
  <select bind:value={person.exchangePermissions}>
    {#if person.exchangePermissions === undefined}
      <option value={undefined}>{$t`Unknown`}</option>
    {/if}
    <option value={ExchangePermissions.None}>{$t`None`}</option>
    <option value={ExchangePermissions.Contributor}>{$t`Contributor`}</option>
    <option value={ExchangePermissions.Reviewer}>{$t`Reviewer`}</option>
    <option value={ExchangePermissions.NoneditingAuthor}>{$t`Nonediting Author`}</option>
    <option value={ExchangePermissions.Author}>{$t`Author`}</option>
    <option value={ExchangePermissions.PublishingAuthor}>{$t`Publishing Author`}</option>
    <option value={ExchangePermissions.Editor}>{$t`Editor`}</option>
    <option value={ExchangePermissions.PublishingEditor}>{$t`Publishing Editor`}</option>
    <option value={ExchangePermissions.Owner}>{$t`Owner`}</option>
  </select>
  <hbox>
    <vbox>
      <label><input type=checkbox disabled={true} checked={!!(person.exchangePermissions & ExchangePermissions.Create)}/> {$t`Create`}</label>
      <label><input type=checkbox disabled={true} checked={!!(person.exchangePermissions & ExchangePermissions.Read)}/> {$t`Read`}</label>
      <label><input type=checkbox disabled={true} checked={person.exchangePermissions == ExchangePermissions.Owner}/> {$t`Owner`}</label>
    </vbox>
    <vbox>
      <label><input type=checkbox disabled={true} checked={!!(person.exchangePermissions & ExchangePermissions.Subfolders)}/> {$t`Create Subfolders`}</label>
      <label><input type=checkbox disabled={true} checked={!!(person.exchangePermissions & ExchangePermissions.WriteOwn)}/> {$t`Write Own Items`}</label>
      <label><input type=checkbox disabled={true} checked={!!(person.exchangePermissions & ExchangePermissions.WriteAll)}/> {$t`Write All Items`}</label>
    </vbox>
  </hbox>
</fieldset>

<script lang="ts">
  import { ExchangePermissions, type ExchangePermission } from "../../../../logic/Mail/EWS/EWSFolder";
  import { t } from "../../../../l10n/l10n";

  export let person: ExchangePermission;
</script>
