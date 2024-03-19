<hbox flex class="checking middle">
  <Spinner size="24px" />
  <hbox flex class="message">
    We are looking for the configuration of your email account...
  </hbox>
</hbox>

<script lang="ts">
  import Spinner from "./Spinner.svelte";
</script>

<style>
  .middle {
    margin-top: 24px;
    margin-bottom: 20px;
  }
  .message {
    margin-left: 8px;
    margin-right: 24px;
    padding: 4px 24px;
    border-radius: 16px;
  }
  .checking .message {
    margin-left: 16px;
    background-color: #F0F9F8;
    color: #455468;
  }
</style>
