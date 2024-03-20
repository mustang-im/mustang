<StatusMessage status="success"
  message="Your email account is working and ready to be used.">
  <CheckIcon slot="icon"/>
</StatusMessage>

<vbox class="workspace">
  <hbox>Is it a work or private account?</hbox>
  <hbox>(o) Work</hbox>
  <hbox>(  ) Private</hbox>
  <hbox>(  ) Other</hbox>
</vbox>

<script lang="ts">
  import CheckIcon from "lucide-svelte/icons/check";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import StatusMessage from "./StatusMessage.svelte";

  export let config: MailAccount;
</script>

<style>
  .workspace {
    margin-top: 32px;
  }
</style>
