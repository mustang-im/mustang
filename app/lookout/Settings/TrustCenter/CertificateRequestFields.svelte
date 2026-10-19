<FormGrid columns="150px minmax(0, 1fr)">
  <span>{$t`Name *=> Name of the person, as written in the certificate`}</span>
  <TextField bind:value={request.name} label={$t`Name *=> Name of the person, as written in the certificate`} />
  <span>{$t`E-mail address`}</span>
  <TextField value={request.emailAddress} readonly label={$t`E-mail address`} />
  <span>{$t`Organization *=> Company or organization of the person`}</span>
  <TextField bind:value={request.organization} label={$t`Organization *=> Company or organization of the person`} />
  <span>{$t`Department *=> Department of the person in the company`}</span>
  <TextField bind:value={request.department} label={$t`Department *=> Department of the person in the company`} />
  <span>{$t`City *=> City of the person or company`}</span>
  <TextField bind:value={request.city} label={$t`City *=> City of the person or company`} />
  <span>{$t`State/Province *=> State or province of the person or company`}</span>
  <TextField bind:value={request.state} label={$t`State/Province *=> State or province of the person or company`} />
  <span>{$t`Country/Region *=> Country or region of the person or company`}</span>
  <TextField bind:value={request.country} label={$t`Country/Region *=> Country or region of the person or company`} width="64px"
    tooltip={$t`The code of the country or region with 2 letters, e.g. DE or US`} />
</FormGrid>

<script lang="ts">
  import type { CertificateRequest } from "./CertificateRequest";
  import FormGrid from "../../Shared/Form/FormGrid.svelte";
  import TextField from "../../Shared/Form/TextField.svelte";
  import { t } from "../../../l10n/l10n";

  export let request: CertificateRequest;
</script>
