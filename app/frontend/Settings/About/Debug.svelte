<vbox>
  <h1>{$t`Debug`}</h1>
  <div class="log-history" bind:this={logHistoryEl}>
    {#each $logHistory.each as log, i}
      <div class="selectable">{i}: {log.map((v) => typeof v === "object" && v !== null ? safeStringify(v) : String(v)).join(" ")}</div>
    {/each}
  </div>
  <vbox class="buttons">
    <Button
      label={$t`Clear log history`}
      onClick={() => logHistory.clear()}
    />
    <Button
      label={$t`Copy to clipboard`}
      onClick={copyLogHistory}
    />
    </vbox>
</vbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
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
        if (value == null) { // or undefined
          return;
        } else if (typeof value === "object") {
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
  .buttons {
    margin-block-start: 16px;
    gap: 8px;
  }
</style>
