<script lang="ts">
  import { reminderListener } from "./Remind";
  import { catchErrors } from "../Util/error";

  $: catchErrors(() => reminderListener());
</script>
