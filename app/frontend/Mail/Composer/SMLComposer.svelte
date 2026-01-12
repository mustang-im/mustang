{#if mail.sml}
  <vbox class="sml">
    {#if testSML}
      <SMLDisplayKinds sml={mail.sml} />
    {:else}
      <SMLEditKinds sml={mail.sml} />
    {/if}
    <hbox class="buttons">
      <Button
        label={testSML ? $t`Edit` : $t`Preview`}
        onClick={() => testSML = !testSML} />
      <Button
        label={$t`Remove`}
        onClick={onRemove} />
    </hbox>
  </vbox>
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import SMLEditKinds from "../SML/SMLEditKinds.svelte";
  import SMLDisplayKinds from "../SML/SMLDisplayKinds.svelte";
  import Button from "../../Shared/Button.svelte";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
  let testSML = false;

  function onRemove() {
    mail.sml = null;
    testSML = false;
  }
</script>

<style>
  .sml {
    margin: 16px 32px;
  }
  .sml .buttons {
    margin: 12px;
    gap: 12px;
  }
</style>
