<div>
  <T msg={`You can find the source code of ${appName} core at # under an #.`}>
    <!-- Slot 1 doesn't need explicit declaration `slot="1"`, it breaks the code. -->
    <a href="https://github.com/mustang-im/mustang" target="_blank">GitHub</a>
    <!-- Slot 2 -->
    <a href="https://raw.githubusercontent.com/mustang-im/mustang/master/LICENSE" target="_blank" slot="2">{$t`Open-Source license`}</a>
  </T>
</div>
<div>
  <T msg={`${appName} is built using the following #. We sincerely thank those authors and contributors.`}>
    <a href="https://github.com/mustang-im/mustang/raw/master/app/public/attribution.txt.gz">{$t`Open-Source components`}</a>
  </T>
</div>

<iframe 
  src="" 
  title="Licenses" sandbox=""
  bind:this={iframeE}
/>

<script lang="ts">
  import { appName } from "../../../logic/build";
  import { t } from "../../../l10n/l10n";
  import T from '../../../l10n/T.svelte';
  import { fetchGzip } from "../../Util/util";
  import { onMount } from "svelte";

  let iframeE: HTMLIFrameElement;

  onMount(async () => {
    iframeE.src = await fetchGzip(new URL("../attribution.txt.gz", import.meta.url).href);
  });
</script>

<style>
  iframe {
    flex: 1 0 0;
    border: none;
    margin-block-start: 32px;
  }
</style>
