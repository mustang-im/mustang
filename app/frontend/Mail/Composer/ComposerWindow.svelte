{#if frontend == "lookout"}
  {#await import("../../../lookout/Mail/Composer/ComposerWindow.svelte") then lookout}
    <svelte:component this={lookout.default} {mail} />
  {/await}
{:else}
  <SecondaryWindow title={$mail.subject || $t`New mail`}>
    <MailComposer {mail} />
  </SecondaryWindow>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import SecondaryWindow from "../../MainWindow/SecondaryWindow.svelte";
  import MailComposer from "./MailComposer.svelte";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;

  const frontendSetting = getLocalStorage("appearance.frontend", "classic");
  $: frontend = $frontendSetting.value;
</script>
