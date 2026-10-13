<script lang="ts">
  import { reminderListener } from "./Remind";
  import { catchErrors } from "../Util/error";
  import { onMount } from "svelte";

  onMount(() => catchErrors(reminderListener));
</script>
