<vbox class="sent-by-explainer">
  <hbox class="help">
    {$t`Help us spread the word about ${appName}!`}
  </hbox>
  <vbox class="sub-box font-small">
    <hbox>{$t`To use ${appName} professionally and remove this note, you can subscribe to one of our plans.`}</hbox>
    <a href={kSubscribeURL} target="_blank">
      <Button
        label={$t`See plans`}
        />
    </a>
  </vbox>
</vbox>

<script lang="ts">
  import Button from "../../../Shared/Button.svelte";
  import { appName, siteRoot } from "../../../../logic/build";
  import { t } from "../../../../l10n/l10n";

  const kSubscribeURL = `${siteRoot}#plans`;
  /*async function onSubscribeClick() {
    await appGlobal.remoteApp.openExternalURL(kSubscribeURL);
  }*/
</script>

<style>
  .sent-by-explainer {
    align-items: end;
  }
  .help {
    color: var(--selected-bg);
    padding: 12px 12px;
    align-self: start;
  }
  .sub-box {
    background-color: var(--appbar-bg);
    color: var(--appbar-fg);
    border-radius: 5px;
    padding: 6px 12px;
    max-width: 24em;
  }
  .sub-box a {
    display: flex;
    justify-content: end;
  }
  .sub-box :global(button) {
    background-color: var(--appbar-fg);
    color: var(--appbar-bg);
    margin: 8px;
  }
</style>
