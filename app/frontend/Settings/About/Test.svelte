<hbox class="buttons">
  <Button label="Load test data"
    onClick={getTestObjects}
    />
</hbox>

<script lang="ts">
  import { getTestObjects } from "../../../logic/testData";
  import Button from "../../Shared/Button.svelte";
</script>

<style>
  .buttons {
    justify-content: end;
  }
</style>
