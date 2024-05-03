<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));
</script>
