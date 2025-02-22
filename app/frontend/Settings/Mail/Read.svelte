<hbox class="groups">
  <!--
  <HeaderGroupBox>
    <hbox slot="header">
      Display
    </hbox>
    <vbox class="formatting">
    </vbox>
  </HeaderGroupBox>
  -->

  <HeaderGroupBox>
    <hbox slot="header">
      {$t`Mark mails as read`}
    </hbox>
    <vbox class="read">
      <label class="radio">
        <input type="radio" value={0} bind:group={readAfter.value} />
        {$t`Immediately`}
      </label>

      <label class="radio">
        <input type="radio" value={readSeconds} bind:group={readAfter.value} />
        <T msg="After displaying for # seconds">
          <input type="number" bind:value={readSeconds} min={1} max={20} maxlength={2} on:change={onReadSecondsChanged} />
        </T>
      </label>

      <label class="radio">
        <input type="radio" value={-1} bind:group={readAfter.value} />
        {$t`Manually`}
      </label>
    </vbox>
  </HeaderGroupBox>
</hbox>

<script lang="ts">
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { t, T } from "../../../l10n/l10n";

  let readAfter = getLocalStorage("mail.read.after", 0);
  let readSeconds = readAfter.value > 0 ? readAfter.value : 5;

  function onReadSecondsChanged() {
    readAfter.value = readSeconds;
  }
</script>

<style>
  .groups {
    flex-wrap: wrap;
  }
  .groups :global(> *) {
    margin-inline-end: 32px;
  }
  .groups :global(.group .content) {
    padding-inline-end: 48px;
  }
  .radio {
    align-items: center;
  }
  label {
    margin-inline-start: 8px;
  }
  input[type="number"] {
    width: 2.5em;
    text-align: end;
  }
</style>
