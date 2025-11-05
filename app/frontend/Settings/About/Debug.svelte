<vbox>
  <h1>Debug</h1>
  <button on:click={() => logHistory.clear()}>Clear log history</button>
  <div class="log-history">
    {#each $logHistory.each as log, i}
      <div class="selectable">{i}: {log.map((v) => typeof v === "object" && v !== null ? safeStringify(v) : String(v)).join(" ")}</div>
    {/each}
  </div>
</vbox>

<script lang="ts">
  import { logHistory } from "./LogHistory";

  // Safe JSON stringifier that handles circular references
  function safeStringify(obj: any): string {
    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        // Skip properties that start with underscore
        if (key && key.startsWith("_")) {
          return undefined;
        }
        if (typeof value === "object" && value !== null) {
          // Handle special object types
          if (value instanceof Error) {
            return value.toString();
          }
          if (value instanceof Event) {
            return `[Event: ${value.type}]`;
          }
          if (value instanceof Node) {
            return `[${value.nodeName || "Node"}]`;
          }
          // Check for circular references
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      });
    } catch (error) {
      // Fallback if JSON.stringify still fails
      try {
        return String(obj);
      } catch {
        return "[Object]";
      }
    }
  }
</script>

<style>
  .log-history {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
