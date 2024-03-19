<hbox flex class="results middle">
  <hbox flex class="message">
    <CheckIcon />
    <vbox>
      <hbox>Congratulations!</hbox>
      <hbox>We found the configuration in our ISP database.</hbox>
    </vbox>
  </hbox>
</hbox>

<script lang="ts">
  import CheckIcon from "lucide-svelte/icons/check";
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
  .results .message {
    padding-left: 16px;
    background-color: #E7F9EC;
    color: #0BC241;
    border: 1px solid #0BC241;
    justify-content: start;
  }
  .results .message :global(svg) {
    margin-right: 6px;
  }
</style>
