<AppObject obj={recipient.person} createObject={() => recipient.createPerson()}>
  <value class="name" title={recipient.name + "\n" + recipient.emailAddress}>
    {personDisplayName(recipient).replace(/@.*/, "")}
  </value>
  {#if !recipient.findPerson()}
    <value class="domain" title={recipient.emailAddress}>
      @{getBaseDomainFromHost(getDomainForEmailAddress(recipient.emailAddress ?? "u@invalid"))}
    </value>
  {/if}
</AppObject>

<script lang="ts">
  import { type PersonUID, personDisplayName } from "../../../logic/Abstract/PersonUID";
  import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../../logic/util/netUtil";
  import AppObject from "../../AppsBar/AppObject.svelte";

  export let recipient: PersonUID;

  // Using `||` instead of `??` above, so that the fallback also works for `name == ""`
</script>

<style>
  :global(.app-object):has(.name) {
    display: block;
  }
  .name {
    display: inline;
    margin-inline-end: 4px;
  }
  .domain {
    display: inline;
    font-weight: normal;
    font-style: italic;
    margin-inline-start: 4px;
  }
</style>
