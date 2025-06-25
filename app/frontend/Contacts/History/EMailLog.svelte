<vbox class="email">
  <div class="subject">
    {message.subject}
  </div>
  <div class="body">
    {message.text?.substring(0, 120) ?? ""}
  </div>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";

  export let message: EMail;
</script>

<style>
  .subject {
    font-weight: bold;
  }
  .subject,
  .body {
    max-height: 1.5em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
