<div class="error">
  {console.error(ex), logError(ex), ""}
  {ex.message ?? ex + ""}
</div>

<script lang="ts">
  import { logError } from "../Util/error";

  export let ex: Error;
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
