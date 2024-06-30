<hbox class="footer">
  <a href="{siteRoot}/eula" target="_blank">{$t`Terms of use`}</a>
  <a href="{siteRoot}/privacy" target="_blank">{$t`Privacy`}</a>
</hbox>

<script lang="ts">
  import { siteRoot } from "../../../../logic/build";
  import { t } from "../../../../l10n/l10n";
</script>

<style>
  .footer {
    margin-block-start: 20px;
  }
  a[href] {
    margin-inline-end: 24px;
    color: #8583A8;
    font-weight: 300;
    font-size: 12px;
  }
</style>
