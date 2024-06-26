<hbox class="buttons">
  <Button label={$t`Load test data`}
    onClick={getTestObjects}
    />
</hbox>

<script lang="ts">
  import { getTestObjects } from "../../../logic/testData";
  import Button from "../../Shared/Button.svelte";
  import { t } from "svelte-i18n-lingui";
</script>

<style>
  .buttons {
    justify-content: end;
  }
</style>
