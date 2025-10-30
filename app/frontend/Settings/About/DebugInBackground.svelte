<script lang="ts">
  import { logHistory } from "./LogHistory";

  const originalLog = console.log;
  const originalError = console.error;

  console.log = function(...args: any[]) {
    logHistory.push(args);
    originalLog.apply(this, args);
  };
  console.error = function(...args: any[]) {
    logHistory.push(args);
    originalError.apply(this, args);
  };
</script>
