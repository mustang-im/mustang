<vbox>
  <h1>Debug</h1>
  <div class="log-history" bind:this={logHistoryEl}>
    {#each $logHistory.each as log, i}
      <div class="selectable">{i}: {log.map((v) => typeof v === "object" && v !== null ? safeStringify(v) : String(v)).join(" ")}</div>
    {/each}
  </div>
  <button on:click={() => logHistory.clear()}>Clear log history</button>
  <button on:click={() => catchErrors(copyLogHistory)}>{$t`Copy to clipboard`}</button>
</vbox>

<script lang="ts">
  import { logHistory } from "../../../logic/util/logHistory";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  function safeStringify(obj: any): string {
    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (key && key.startsWith("_")) {
          return undefined;
        }
        if (typeof value === "object" && value !== null) {
          if (value instanceof Error) {
            return value.toString();
          }
          if (value instanceof Event) {
            return `[Event: ${value.type}]`;
          }
          if (value instanceof Node) {
            return `[${value.nodeName || "Node"}]`;
          }
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      });
    } catch (error) {
      try {
        return String(obj);
      } catch {
        return "[Object]";
      }
    }
  }

  let logHistoryEl: HTMLDivElement;
  async function copyLogHistory() {
    navigator.clipboard.writeText(logHistoryEl.innerText);
  }
</script>

<style>
  .log-history {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
