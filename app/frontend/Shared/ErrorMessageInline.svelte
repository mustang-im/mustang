<hbox>
  <div class="error">
    {console.error(ex), logError(ex), ""}
    {ex.message ?? ex + ""}
  </div>
  {#if withCloseButton}
    <RoundButton
      icon={CloseIcon}
      iconSize="16px" classes="plain small" border={false}
      on:click={onClose} />
  {/if}
</hbox>

<script lang="ts">
  import { logError } from "../Util/error";
  import RoundButton from "./RoundButton.svelte";
  import CloseIcon from "lucide-svelte/icons/x";

  export let ex: Error | null;
  export let withCloseButton: boolean = false;

  function onClose() {
    ex = null;
  }
</script>

<style>
  .error {
    background-color: red;
    color: white;
    padding: 8px 12px;
    border-radius: 3px;
    margin: 8px;
  }
</style>
