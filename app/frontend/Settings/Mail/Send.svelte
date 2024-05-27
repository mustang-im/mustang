<hbox class="groups">
  <HeaderGroupBox>
    <hbox slot="header">
      Quote
    </hbox>
    <vbox class="quote">
      <hbox class="subtitle">When replying:</hbox>

      <label class="radio">
        <input type="radio" value="below" bind:group={$quoteSetting.value} />
        Reply above, Quote below
      </label>
      <img src={quoteBelowImg} title="Quote below" alt="Quote below" width="256" height="112" />

      <label class="radio">
        <input type="radio" value="above" bind:group={$quoteSetting.value} />
        Reply below, Quote above
      </label>
      <img src={quoteAboveImg} title="Quote above" alt="Quote above" width="256" height="112" />

      <label class="radio">
        <input type="radio" value="none" bind:group={$quoteSetting.value} />
        Do not quote
      </label>
      <hbox />
    </vbox>
  </HeaderGroupBox>

  <HeaderGroupBox>
    <hbox slot="header">
      Composition
    </hbox>
    <vbox class="format">
      <label class="radio">
        <input type="radio" value="html" bind:group={$formatSetting.value} />
        Send as HTML and Plaintext
      </label>
      <img src={htmlImg} title="HTML" alt="HTML" width="335" height="107" />

      <label class="radio">
        <input type="radio" value="plaintext" bind:group={$formatSetting.value} />
        Send as Plaintext only
      </label>
      <img src={plaintextImg} title="Plaintext" alt="Plaintext" width="413" height="88" />
    </vbox>
  </HeaderGroupBox>
</hbox>

<script lang="ts">
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import htmlImg from "../../asset/settings/mail/send/html.png";
  import plaintextImg from "../../asset/settings/mail/send/plaintext.png";
  import quoteBelowImg from "../../asset/settings/mail/send/quote-below.png";
  import quoteAboveImg from "../../asset/settings/mail/send/quote-above.png";

  let formatSetting = getLocalStorage("mail.send.format", "html");
  let quoteSetting = getLocalStorage("mail.send.quote", "below");
</script>

<style>
  .groups {
    flex-wrap: wrap;
  }
  .groups :global(> *) {
    margin-right: 32px;
  }
  .groups :global(.group .content) {
    margin-right: 32px;
  }
  .subtitle {
    margin-bottom: 16px;
  }
  img {
    margin: 4px 0px 24px 28px;
  }
  .radio {
    align-items: center;
  }
  label {
    margin-left: 8px;
  }
  .format img {
    opacity: 80%;
  }
  .quote img {
    opacity: 50%;
  }
</style>
