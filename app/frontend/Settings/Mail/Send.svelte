<HeaderGroupBox>
  <hbox slot="header">
    {$t`Quote`}
  </hbox>
  <vbox>
    <hbox class="subtitle">{$t`When replying:`}</hbox>

    <hbox class="quote">
      <vbox>
        <label class="radio">
          <input type="radio" value="below" bind:group={quoteSetting.value} />
          {$t`Quote below, Reply above`}
        </label>
        <img src={quoteBelowImg} title={$t`Quote below`} alt={$t`Quote below`} width="166" height="94" />
      </vbox>

      <vbox>
        <label class="radio">
          <input type="radio" value="above" bind:group={quoteSetting.value} />
          {$t`Quote above, Reply below`}
        </label>
        <img src={quoteAboveImg} title={$t`Quote above`} alt={$t`Quote above`} width="163" height="99" />
      </vbox>

      <vbox>
        <label class="radio">
          <input type="radio" value="none" bind:group={quoteSetting.value} />
          {$t`Do not quote`}
        </label>
        <hbox />
      </vbox>
    </hbox>
  </vbox>
</HeaderGroupBox>

<HeaderGroupBox>
  <hbox slot="header">
    {$t`Formatting`}
  </hbox>
  <hbox class="format">
    <vbox>
      <label class="radio">
        <input type="radio" value="html" bind:group={formatSetting.value} />
        {$t`Send as HTML and Plaintext`}
      </label>
      <img src={htmlImg} title={$t`HTML`} alt={$t`HTML`} width="248" height="96" />
    </vbox>

    <vbox>
      <label class="radio">
        <input type="radio" value="plaintext" bind:group={formatSetting.value} />
        {$t`Send as Plaintext only`}
      </label>
      <img src={plaintextImg} title={$t`Plaintext`} alt={$t`Plaintext`} width="290" height="77" />
    </vbox>
  </hbox>
</HeaderGroupBox>

<HeaderGroupBox>
  <hbox slot="header">
    {$t`Composition`}
  </hbox>
  <hbox class="composition">
    <input type="checkbox" bind:checked={spellcheckEnabledSetting.value} name="spellcheck" />
    <label class="spellcheck" for="spellcheck">
      {$t`Spell check`}
    </label>
  </hbox>
</HeaderGroupBox>

<script lang="ts">
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import htmlImg from "../../asset/settings/mail/send/html.png";
  import plaintextImg from "../../asset/settings/mail/send/plaintext.png";
  import quoteBelowImg from "../../asset/settings/mail/send/quote-below.png";
  import quoteAboveImg from "../../asset/settings/mail/send/quote-above.png";
  import { t } from "../../../l10n/l10n";

  let formatSetting = getLocalStorage("mail.send.format", "html");
  let quoteSetting = getLocalStorage("mail.send.quote", "below");
  let spellcheckEnabledSetting = getLocalStorage("mail.send.spellcheck.enabled", false);
</script>

<style>
  .subtitle {
    margin-block-end: 16px;
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
  label.spellcheck {
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: red;
  }
  .radio {
    align-items: center;
  }
  input[type="checkbox"] {
    margin-inline-end: 12px;
  }
  label {
    margin-inline-start: 8px;
  }
  .format img {
    opacity: 80%;
  }
  .quote img {
    opacity: 50%;
  }
</style>
