<hbox class="non-domain">{nonDomain}</hbox><hbox class="domain">{domain}</hbox>

<script lang="ts">
  import { getBaseDomainFromHost } from "../../../logic/util/netUtil";


  /** in */
  export let hostname: string;

  $: domain = getBaseDomainFromHost(hostname);
  $: nonDomain = hostname.substring(0, hostname.length - domain.length);
</script>

<style>
  .domain {
    font-weight: bold;
    opacity: 100%;
  }
  .non-domain {
    opacity: 70%;
  }
</style>
