<select bind:value>
  <option value="none">{$t`None`}</option>
  <option value="read">{$t`Read`}</option>
  <option value="create">{$t`Create`}</option>
  <option value="write">{$t`Modify`}</option>
</select>

<script lang="ts">
  import { t } from "../../../../l10n/l10n";
  
  export let value: string;
</script>
