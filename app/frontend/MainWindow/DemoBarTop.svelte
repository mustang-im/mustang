{#if $isDemo}
  <hbox class="demo-bar">
    <hbox flex />
    <div class="message value">
      {$t`This is a demo for what is planned for the future`}
    </div>
    <hbox flex />
  </hbox>
{/if}

<script lang="ts">
  import { isDemo } from "../AppsBar/demo";
  import { t } from "../../l10n/l10n";
</script>

<style>
  .demo-bar {
    align-items: center;
    background-color: #FFF160;
    color: #160C27;
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
    z-index: 3;
  }
  .message {
    margin: 2px 16px;
  }
</style>
