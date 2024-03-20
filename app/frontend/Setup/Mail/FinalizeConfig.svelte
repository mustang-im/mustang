<vbox flex class="results">
  <hbox flex class="message">
    <CheckIcon />
    <vbox>
      <hbox>Your email account is working and ready to be used.</hbox>
    </vbox>
  </hbox>
</vbox>

<vbox class="workspace">
  <hbox>Is it a work or private account?</hbox>
  <hbox>(o) Work</hbox>
  <hbox>(  ) Private</hbox>
  <hbox>(  ) Other</hbox>
</vbox>

<script lang="ts">
  import CheckIcon from "lucide-svelte/icons/check";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";

  export let config: MailAccount;
</script>

<style>
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
  .workspace {
    margin-top: 32px;
  }
</style>
