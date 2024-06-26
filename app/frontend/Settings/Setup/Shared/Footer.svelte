<hbox class="footer">
  <a href="{siteRoot}/eula" target="_blank">{$t`Terms of use`}</a>
  <a href="{siteRoot}/privacy" target="_blank">{$t`Privacy`}</a>
</hbox>

<script lang="ts">
  import { siteRoot } from "../../../../logic/build";
  import { t } from "svelte-i18n-lingui";
</script>

<style>
  .footer {
    margin-top: 20px;
  }
  a[href] {
    margin-right: 24px;
    color: #8583A8;
    font-weight: 300;
    font-size: 12px;
  }
</style>
