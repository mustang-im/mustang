<script lang="ts">
  import { App } from "@capacitor/app";
  import { navigate } from "svelte-navigator";

  App.addListener("backButton", ({canGoBack}) => {
    if (canGoBack) {
      navigate(-1);
    } else {
      App.exitApp();
    }
  });
</script>
