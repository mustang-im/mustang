<HeaderGroupBox>
  <hbox slot="header">
    Composition
  </hbox>
  <vbox class="send-format">
    <hbox class="radio">
      <input type="radio" value="html" bind:group={$formatSetting.value} name="html" />
      <label for="html">Send as HTML and Plaintext</label>
    </hbox>
    <img src={htmlImg} title="HTML" alt="HTML" width="274" height="126" />

    <hbox class="radio">
      <input type="radio" value="plaintext" bind:group={$formatSetting.value} name="plaintext" />
      <label for="html">Send as Plaintext only</label>
    </hbox>
    <img src={plaintextImg} title="Plaintext" alt="Plaintext" width="250" height="117" />
  </vbox>
</HeaderGroupBox>

<script lang="ts">
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import htmlImg from "../../asset/settings/mail/send/html.png";
  import plaintextImg from "../../asset/settings/mail/send/plaintext.png";

  let formatSetting = getLocalStorage("mail.send.format", "html");
</script>

<style>
  img {
    margin: 4px 0px 24px 28px;
  }
  .radio {
    align-items: center;
  }
  label {
    margin-left: 8px;
  }
</style>
