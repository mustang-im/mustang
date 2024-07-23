  <hbox class="header"></hbox>
  <hbox class="label">{$t`Protocol`}</hbox>
  <hbox class="label">{$t`Hostname`}</hbox>
  {#if stepFull}
    <hbox class="label">{$t`Port`}</hbox>
    <hbox class="label">{$t`Connection encryption`}</hbox>
    <hbox class="label">{$t`Authentication method`}</hbox>
    <hbox class="label">{$t`Username`}</hbox>
    <hbox class="label">{$t`Password`}</hbox>
  {/if}

<script lang="ts">
  import { t } from "../../../../../l10n/l10n";

  export let stepFull: boolean;
</script>
