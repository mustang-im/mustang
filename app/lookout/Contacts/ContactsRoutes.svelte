<Route path="person/:personID/edit" let:params={urlParams}>
  {#key params?.person ?? urlParams.personID}
    <ContactForm person={params?.person ?? appGlobal.persons.find(person => person.id == urlParams.personID) ?? requiredParam()} />
  {/key}
</Route>
<Route path="group/:groupID/edit" let:params={urlParams}>
  {#key params?.group ?? urlParams.groupID}
    <GroupForm group={params?.group ?? findGroup(urlParams.groupID) ?? requiredParam()} />
  {/key}
</Route>
<Route path="/">
  <ContactsPage />
</Route>

<script lang="ts">
  import type { Group } from "../../logic/Abstract/Group";
  import { appGlobal } from "../../logic/app";
  import ContactsPage from "./ContactsPage.svelte";
  import ContactForm from "./ContactForm.svelte";
  import GroupForm from "./GroupForm.svelte";
  import { getParams } from "../../frontend/AppsBar/selectedApp";
  import { requiredParam } from "../../frontend/Util/route";
  import { Route, useLocation } from "svelte-navigator";

  $: location = useLocation();
  $: params = getParams($location?.state);

  function findGroup(id: string): Group | undefined {
    for (let addressbook of appGlobal.addressbooks) {
      let group = addressbook.groups.find(group => group.id == id);
      if (group) {
        return group;
      }
    }
    return undefined;
  }
</script>
