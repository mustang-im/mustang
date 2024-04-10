<hbox class="buttons">
  <Button label="Load test data"
    on:click={() => catchErrors(getTestObjects)}
    />
</hbox>

<script lang="ts">
  import { getTestObjects } from "../../../logic/testData";
  import Button from "../../Shared/Button.svelte";
  import { catchErrors } from "../../Util/error";
</script>

<style>
  .buttons {
    justify-content: end;
  }
</style>
