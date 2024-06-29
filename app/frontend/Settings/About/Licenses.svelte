<div>
  <T msg="You can find the source code of # core at # under an #.">
    <!-- Slot 0 doesn't need explicit declaration `slot="0"`, it breaks the code. -->
    <span>{appName}</span>
    <!-- Slot 1 -->
    <a href="https://github.com/mustang-im/mustang" target="_blank" slot="1">GitHub</a>
    <!-- Slot 2 -->
    <a href="https://raw.githubusercontent.com/mustang-im/mustang/master/LICENSE" target="_blank" slot="2">{$t`Open-Source license`}</a>
  </T>
</div>
<div>
  {$t`${appName} is built using the following Open-Source components.
  We sincerely thank those authors and contributors.`}
</div>

<iframe src="public/attribution.txt.gz" title="Licenses" sandbox="" />

<script>
  import { appName } from "../../../logic/build";
  import { t, T } from "svelte-i18n-lingui";
</script>

<style>
  iframe {
    flex: 1 0 0;
    border: none;
    margin-top: 32px;
  }
</style>
