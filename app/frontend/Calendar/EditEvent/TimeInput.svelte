<input bind:value={userValue} on:change={onChange} bind:this={inputE} />

<script lang="ts">
  export let time: Date; /* in/out */

  let inputE: HTMLInputElement;

  $: userValue = convertToUserInput(time);
  function convertToUserInput(time: Date): string {
    try {
      return time.toLocaleString(undefined, {
        hour: "numeric",
        minute: "numeric",
      });
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }

  export function onChange() {
    try {
      time = new Date(userValue);
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }
</script>

<style>
input {
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
}
</style>

