<hbox bind:this={eventTargetE} />

<script lang="ts">
  import { showError } from "../Util/error";
  import { goTo } from "../AppsBar/selectedApp";
  import { App } from "@capacitor/app";
  import { gestures } from "@composi/gestures";
  import { navigate } from "svelte-navigator";

  gestures();

  App.addListener("backButton", ({canGoBack}) => {
    if (canGoBack) {
      navigate(-1);
    } else {
      // App.exitApp(); TODO crashes on re-launch
      goTo("/app-menu/", {});
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
