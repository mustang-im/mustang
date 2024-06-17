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
      Mark mails as read
    </hbox>
    <vbox class="read">
      <label class="radio">
        <input type="radio" value={0} bind:group={readAfter.value} />
        Immediately
      </label>

      <label class="radio">
        <input type="radio" value={readSeconds} bind:group={readAfter.value} />
        After displaying for
        <input type="number" bind:value={readSeconds} min={1} max={20} maxlength={2} on:change={onReadSecondsChanged} />
        seconds
      </label>

      <label class="radio">
        <input type="radio" value={-1} bind:group={readAfter.value} />
        Manually
      </label>
    </vbox>
  </HeaderGroupBox>
</hbox>

<script lang="ts">
  import HeaderGroupBox from "../../Shared/HeaderGroupBox.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";

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
    margin-right: 32px;
  }
  .groups :global(.group .content) {
    padding-right: 48px;
  }
  .radio {
    align-items: center;
  }
  label {
    margin-left: 8px;
  }
  input[type="number"] {
    width: 2.5em;
    text-align: end;
  }
</style>
