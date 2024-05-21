<vbox class="sent-by-explainer">
  <hbox class="help">
    Help us spread the word about Mustang!
  </hbox>
  <vbox class="sub-box">
    <hbox>To use Mustang professionally and remove this note, you can subscribe to one of our plans.</hbox>
    <a href={kSubscribeURL} target="_blank">
      <Button
        label="See plans"
        />
    </a>
  </vbox>
</vbox>

<script lang="ts">
  import Button from "../../../Shared/Button.svelte";

  const kSubscribeURL = "https://mustang.im#plans";
  /*async function onSubscribeClick() {
    await appGlobal.remoteApp.shell.openExternal(kSubscribeURL);
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
    font-size: 14px;
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
