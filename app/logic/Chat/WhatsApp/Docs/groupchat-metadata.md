# Querying group chat metadata

WhatsApp Android wire protocol for
fetching a group's metadata: subject, participants, admins, settings.

## (a) The query IQ

```xml
<iq id="<random>" type="get" xmlns="w:g2" to="120363…@g.us">
  <query request="interactive"/>
</iq>
```

- `xmlns` = `w:g2`, `type` = `get`.
- `to` = the **group JID itself**, not a server.
- The single child is `<query request="interactive"/>`.

## (b) The response `<group>` element

The result is `<iq type="result">` containing one `<group>`.

`<group>` attributes:

| attr | meaning |
|---|---|
| `id` | group id **without** the `@g.us` suffix |
| `creator` / `creator_pn` | creator JID (LID or PN per addressing mode); `creator_pn` is the phone form when LID-addressed |
| `subject` | group name |
| `s_t` | subject set time (unix seconds) |
| `s_o` / `s_o_pn` | subject owner JID (and its phone form when LID-addressed) |
| `creation` | group creation time (unix seconds) |
| `size` | participant count |
| `addressing_mode` | `"pn"` or `"lid"` |
| `a_v_id` / `p_v_id` | announce / participant version ids |

`<group>` children:

| child | meaning |
|---|---|
| `<participant jid= [type=] [phone_number=] [lid=]>` | one per member (see c) |
| `<description id= participant= participant_pn= t=><body>…</body></description>` | group topic + who/when set |
| `<announcement/>` | admins-only **post** |
| `<locked/>` | admins-only **edit info** |
| `<ephemeral expiration=…/>` | disappearing-messages timer (seconds) |
| `<member_add_mode>` | `admin_add` or `all_member_add` |
| `<linked_parent jid=…/>` | this group's parent community |
| `<parent …/>` | this group IS a community |
| `<default_sub_group/>` | this is a community's announcement subgroup |
| `<membership_approval_mode/>` | join requests need admin approval |
| `<incognito/>`, `<suspended/>` | group flags |

Annotated example (LID-addressed):

```xml
<iq type="result" from="120363…@g.us">
  <group id="120363…" subject="Weekend Hikers" s_t="1700000000"
         s_o="111…@lid" s_o_pn="49170000001@s.whatsapp.net"
         creation="1699000000" size="3" addressing_mode="lid">
    <participant jid="111…@lid" type="superadmin" phone_number="49170000001@s.whatsapp.net"/>
    <participant jid="222…@lid" type="admin"       phone_number="49170000002@s.whatsapp.net"/>
    <participant jid="333…@lid"                     phone_number="49170000003@s.whatsapp.net"/>
    <description id="…" participant="111…@lid" t="1700500000"><body>Trail plans</body></description>
    <announcement/>
    <ephemeral expiration="604800"/>
  </group>
</iq>
```

## (c) Participant addressing — pn vs lid

`addressing_mode` is `"pn"` or `"lid"`. Per participant, the alternate address is
keyed by the server of the `jid` attribute:

- **LID mode**: `<participant jid="…@lid" phone_number="…@s.whatsapp.net"/>`.
- **PN mode**: `<participant jid="…@s.whatsapp.net" lid="…@lid"/>`.

`type` ∈ {`admin`, `superadmin`} marks an admin (`superadmin` = creator/owner); a
regular member has no `type`. Keep both addresses so a later send can pick the
right identity.

## (d) Group / community JIDs

All are `@g.us`. A community has `<parent/>`; a group inside a community has
`<linked_parent jid=…/>`; a community's announcement subgroup has
`<default_sub_group/>`. Modern group ids are server-assigned 18-digit numbers
(`120363…`); legacy ids are `<creatorPN>-<creationUnixTime>`.

An "all participating groups" query uses `to="@g.us"`, child
`<participating><participants/><description/></participating>`, returning
`<groups><group …/>…</groups>`; it is triggered when the post-login `<ib>` reports
`dirty type="groups"`.

## (e) When to fetch & cache

Fetch the metadata on first sight of a group and before sending (the participant
list + addressing mode are needed for the sender-key fan-out). Cache it; patch the
cache in place on `w:gp2` change notifications rather than re-fetching. Invalidate
(re-fetch) when a send's ack returns a participant-list hash that differs from the
one we computed (the device list changed).

## (f) Mapping to our code

- `WhatsAppGroupMetadata.fetch` sends the IQ; `WhatsAppGroupMetadata.parse` parses
  the `<group>` element; `applyTo` writes name/description/participants onto the
  address-book `Group`.
- `WhatsAppAccount.getGroupMetadata` caches (and persists) the result and coalesces
  concurrent fetches; `getOrCreateGroup` fetches in the background so a group first
  seen live gets its real name; `WhatsAppChatRoom.listMembers` resolves participants
  to contacts.
