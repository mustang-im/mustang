<HeaderGroupBox>
  <hbox slot="header">
    Quote
  </hbox>
  <vbox>
    <hbox class="subtitle">When replying:</hbox>

    <hbox class="quote">
      <vbox>
        <label class="radio">
          <input type="radio" value="below" bind:group={$quoteSetting.value} />
          Quote below, Reply above
        </label>
        <img src={quoteBelowImg} title="Quote below" alt="Quote below" width="166" height="94" />
      </vbox>

      <vbox>
        <label class="radio">
          <input type="radio" value="above" bind:group={$quoteSetting.value} />
          Quote above, Reply below
        </label>
        <img src={quoteAboveImg} title="Quote above" alt="Quote above" width="163" height="99" />
      </vbox>

      <vbox>
        <label class="radio">
          <input type="radio" value="none" bind:group={$quoteSetting.value} />
          Do not quote
        </label>
        <hbox />
      </vbox>
    </hbox>
  </vbox>
</HeaderGroupBox>

<HeaderGroupBox>
  <hbox slot="header">
    Composition
  </hbox>
  <hbox class="format">
    <vbox>
      <label class="radio">
        <input type="radio" value="html" bind:group={$formatSetting.value} />
        Send as HTML and Plaintext
      </label>
      <img src={htmlImg} title="HTML" alt="HTML" width="248" height="96" />
    </vbox>

    <vbox>
      <label class="radio">
        <input type="radio" value="plaintext" bind:group={$formatSetting.value} />
        Send as Plaintext only
      </label>
      <img src={plaintextImg} title="Plaintext" alt="Plaintext" width="290" height="77" />
    </vbox>
  </hbox>
</HeaderGroupBox>

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
  .subtitle {
    margin-bottom: 16px;
  }
  hbox.quote,
  hbox.format {
    flex-wrap: wrap;
  }
  .quote img {
    margin: 12px 48px 24px 28px;
  }
  .format img {
    margin: 16px 32px 24px 28px;
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
