<vbox>
  <h1>{$t`Debug log`}</h1>
  <div class="log-history" bind:this={logHistoryEl}>
    {#each $logHistory.each as log, i}
      <div class="line selectable">{i}: {ensureArray(log).map(v => safeStringify(v)).join(" ")}</div>
    {/each}
  </div>
  <hbox class="buttons">
    <Button
      label={$t`Copy to clipboard`}
      onClick={copyLogHistory}
    />
    <Button
      label={$t`Clear log history`}
      onClick={() => logHistory.clear()}
    />
  </hbox>
</vbox>

<script lang="ts">
  import Button from "../../Shared/Button.svelte";
  import { logHistory } from "../../../logic/util/logHistory";
  import { ensureArray } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  function safeStringify(obj: any): string {
    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (key && key.startsWith("_")) {
          return undefined;
        } else if (value == null) { // or undefined
          return "";
        } else if (["nextTime"].includes(key)) { // noise useless properties
          return "(ignored)";
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
      }, 2);
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
    navigator.clipboard.writeText(logHistoryEl.innerText + "\n");
  }
</script>

<style>
  .log-history {
    max-height: 500px;
    overflow-y: auto;
  }
  .line {
    white-space: pre-wrap;
  }
  .buttons {
    margin-block-start: 16px;
    gap: 8px;
  }
</style>
