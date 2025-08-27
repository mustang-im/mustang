<hbox bind:this={eventTargetE} />

<script lang="ts">
  import { App } from "@capacitor/app";
  import { navigate } from "svelte-navigator";
  import { showError } from "../Util/error";

  App.addListener("backButton", ({canGoBack}) => {
    if (canGoBack) {
      navigate(-1);
    } else {
      App.exitApp();
    }
  });

  let eventTargetE: HTMLDivElement;
  App.addListener("appUrlOpen", ({url, iosSourceApplication, iosOpenInPlace}) => {
    try {
      let urlObj = new URL(url);
      let protocol = urlObj.protocol.replace(":", "");
      let urlEvent = new Event("url-" + protocol); // e.g. "url-mailto"
      (urlEvent as any).url = url;
      eventTargetE.dispatchEvent(urlEvent);
    } catch (ex) {
      showError(ex);
    }
  });
</script>
