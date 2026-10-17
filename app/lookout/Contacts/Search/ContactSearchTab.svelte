<RibbonTab label={$t`Search`} isSelected>
  <RibbonGroup label={$t`Scope`}>
    <RibbonToggleButton label={$t`Current Folder`} icon={CurrentFolderIcon} isRadio
      checked={$options.scope == ContactSearchScope.CurrentFolder}
      disabled={!hasSelectedAddressbook && $t`Select an address book first`}
      tooltip={$t`Search only the selected address book`}
      onChange={() => update({ scope: ContactSearchScope.CurrentFolder })} />
    <RibbonToggleButton label={$t`All Contact Items`} icon={AllContactsIcon} isRadio
      checked={$options.scope == ContactSearchScope.AllContactItems || !hasSelectedAddressbook}
      tooltip={$t`Search all address books and directories`}
      onChange={() => update({ scope: ContactSearchScope.AllContactItems })} />
  </RibbonGroup>
  <RibbonGroup label={$t`Refine`}>
    <RibbonToggleButton label={$t`Has Phone Number`} icon={PhoneIcon}
      checked={$options.hasPhoneNumber}
      onChange={checked => update({ hasPhoneNumber: checked })} />
    <RibbonToggleButton label={$t`Has Address`} icon={AddressIcon}
      checked={$options.hasAddress}
      onChange={checked => update({ hasAddress: checked })} />
    <RibbonToggleButton label={$t`Has E-mail Address`} icon={MailIcon}
      checked={$options.hasEMailAddress}
      onChange={checked => update({ hasEMailAddress: checked })} />
  </RibbonGroup>
  <RibbonGroup label={$t`Close`}>
    <RibbonButton label={$t`Close Search`} icon={CloseIcon} shortCutInfo="Esc"
      onClick={closeSearch} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import { ContactSearch } from "../ContactSearch";
  import { contactSearchOptions as options, ContactSearchScope, type ContactSearchOptions } from "../Person/Selected";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import CurrentFolderIcon from "lucide-svelte/icons/book-user";
  import AllContactsIcon from "lucide-svelte/icons/library";
  import PhoneIcon from "lucide-svelte/icons/phone";
  import AddressIcon from "lucide-svelte/icons/map-pin";
  import MailIcon from "lucide-svelte/icons/mail";
  import CloseIcon from "lucide-svelte/icons/x";
  import { t } from "../../../l10n/l10n";

  export let hasSelectedAddressbook: boolean;


  function update(change: Partial<ContactSearchOptions>) {
    $options = { ...$options, ...change };
  }

  // <copied from="../ContactsAppD.svelte">
  function closeSearch() {
    $options = ContactSearch.defaultOptions($options.scope);
  }
  // </copied>
</script>
