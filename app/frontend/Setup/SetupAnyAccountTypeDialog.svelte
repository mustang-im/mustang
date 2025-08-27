<vbox flex class="import-window">
  <hbox flex />
  <vbox class="page-box">
    <SetupAnyAccountType />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import BackgroundVideo from "./Shared/BackgroundVideo.svelte";
  import SetupAnyAccountType from "./SetupAnyAccountType.svelte";
</script>

<style>
  .import-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  :global(.mobile) .page-box {
    padding: 12px 24px;
  }
</style>
