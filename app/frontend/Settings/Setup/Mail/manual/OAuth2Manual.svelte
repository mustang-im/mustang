<HeaderGroupBox>
  <hbox slot="header">OAuth2</hbox>
  <vbox class="content">
    <grid>
      <label for="ui">Login UI</label>
      <hbox class="ui">
        <select bind:value={oAuth2.uiMethod} required name="ui">
          <option value={OAuth2UIMethod.Dialog}>Inside app UI</option>
          <option value={OAuth2UIMethod.Window}>Separate window</option>
          <option value={OAuth2UIMethod.SystemBrowser}>Browser</option>
        </select>
      </hbox>

      <!--
      <label for="authURL">Login URL</label>
      <input type="url" bind:value={oAuth2.authURL} required name="authURL" />

      <label for="authDoneURL">Login finished URL</label>
      <input type="url" bind:value={oAuth2.authDoneURL} required name="authDoneURL" />

      <label for="tokenURL">Token URL</label>
      <input type="url" bind:value={oAuth2.tokenURL} required name="tokenURL" />

      <label for="tokenPasswordURL">Password URL</label>
      <input type="url" bind:value={oAuth2.tokenURLPasswordAuth} name="tokenPasswordURL" />

      <label for="scope">Scope</label>
      <input type="text" bind:value={oAuth2.scope} required name="scope" />

      <label for="clientID">Client ID</label>
      <input type="password" bind:value={oAuth2.clientID} required name="clientID" />

      <label for="clientSecret">Client secret</label>
      <input type="password" bind:value={oAuth2.clientSecret} name="clientSecret" />
      -->
    </grid>
  </vbox>
</HeaderGroupBox>

<script lang="ts">
  import { OAuth2UIMethod } from "../../../../../logic/Auth/OAuth2UIMethod";
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import HeaderGroupBox from "../../../../Shared/HeaderGroupBox.svelte";

  /** in */
  export let config: MailAccount;
  $: oAuth2 = config.oAuth2;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
