<vbox class="dialpad">
  <grid class="numbers">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"] as digit}
      <RoundButton
        label={digit.toString()}
        onClick={() => onSendNumber(digit)}
        >
        <hbox class="digit font-large" slot="icon">{digit}</hbox>
      </RoundButton>
    {/each}
  </grid>
</vbox>

<script lang="ts">
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ digit: number | string }>();

  function onSendNumber(digit: number | string) {
    dispatchEvent("digit", digit);
  }
</script>

<style>
  grid.numbers {
    grid-template-columns: auto auto auto;
    gap: 8px;
  }
  .numbers :global(button) {
    width: 48px;
    height: 48px;
  }
  .digit {
    opacity: 50%;
  }

</style>
