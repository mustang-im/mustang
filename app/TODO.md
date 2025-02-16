# Next
* Mail
  * Main/Dependent accounts
    * Calendar
    * SMTP
    * OAuth2
  * OAuth2 login UI with browser/URL options
  * Calendar
    * Invitation UI
    * Participants
    * Free/Busy
    * Move to other calendar
  * Main window
    * Save window size
  * Bug: Thunderbird AB import misses ABs and fields
  * Import Outlook PST
  * Inline images
    * Display cid:
    * Scale when sending
  * FastTree
    * Drag&Drop: Open on drag over - for: Move messages to deep subfolders -> Rewrite FastTree
  * Bug: FastList doesn't update some rows #66
  * Bug: FastList misses last row (off-by-1)
  * Threads
    * Search all folders
    * Hide quotes
    * Message list: Threaded view?
    * Mail Chat view: Open thread
  * Actions (Filters) (after search)
    * Create
    * List
    * Edit
    * Run
  * Tags: Shrink tag list when not enough space
  * All accounts
    * Fix mergeColls() #72
    * Use search folder
  * Setup mail
    * After account delete: remove general panel
    * Scroll inside dialog, not whole window

# Initial release
* Beta notification bar
* Beta time-bomb
* License client

# Feedback
## Elena
* Clear profile
* Debug dump of settings
* Composer
  * PersonEntry: Delete key
  * Remove added attachment (needs menu item)
  * Open attachment
* Setup
  * OAuth2 login: Close window. Login button disabled.
  * Icons based on provider or domain
* Mail Persons view: Sort by recency or by name
* Contacts
  * Merge: too many clicks, with confirmation dialog
  * Delete: requires 2 clicks: Edit, then Delete. Too slow.
* Saved Searches delete: Update list
* List view: Sort order
* MailChat/Thread: Jail HTML: Styles and size
## Nick
* Mac: M1 needs 50s to start, 30s for second start
* Mac: Use Mac Password manager
* Gmail: Log in with browser
* Manual setup: OAuth2 UI: "Browser" goes back to "Seperate window"
## Freshness
* Account colors
* Icons for accounts, based on favicon or user-set
* Pic for users, in identities
* Unified inbox: Show account as tag or icon

# UI
* Close menu when clicking inside message

# Chat
## Bugs
* SqliteError: NOT NULL constraint failed: chatAccount.userRealname

## UI
* Message menu
  * Emoji reaction
  * Reply
* User is typing
* Group chat
  * Need: Router, for: Click on name -> Contacts
  * Show list of participants?
  * Show number of participants
* Contact person
* Join group
  * Via group name or URL
  * Search
* Create group
* Link URLs
* Detect MarkDown in plaintext messages

## Editor
* Emojis
* Attachments
* Giffy

## XMPP
* Finish implementatoin

## Matrix
* Fix impl
* Key sync doesn't work right
* Message impl
  * Room title change
  * Person name chage
* Bug: Re-logins by itself

## Other protocols
* Teams
* Signal
* WhatsApp
* DIM <https://www.dim.chat>
* Discord
* Find a suitable open protocol

# Contacts
* Groups
* Placeholder when we have no image for a person

# Calendar
* New event dialog
* Protocol implementation
  * CalDav
  * ical
  * JMAP
  * JSCalendar
* Invitation send
* Invitation receive
* Free/busy dialog

# Meet
## UI
* Open/close cam and mic
* UI before joining conference

## Protocol
* M3 server
  * Participant opening/closing cam is delayed
  * Mute/unmute without destroying stream
  * TURN server
  * Re-connect
  * Lower resolution video
  * Show Internet connection quality for self and other participants
* XMPP 1:1
* XMPP group?
* Matrix 1:1
* Matrix group?
* Jitsi server
* Video streaming

## Proprietary protocols
* Teams
* WebEx
* Amazon conf
* WhatsApp
* Zoom

# Mail

## IMAP
* UIDONLY (if available): Enable and test
* Fallback: When UID not at all supported
* Download all msgs in folder: When?
* Subscribed folders only, and subscription UI
* Move folder

## JMAP
* EventSource
* WebSocket

### Intentionally not implemented
* Expunge on quit

## Missing features
* Filters / Actions
* Spam filter
* Archive
* Undo
* IMAP Quota
* IMAP ACL: Share mailbox/folders with colleages
* Thread pane sort
* Threading in Thread pane
* Save/Load mail as .eml file
* OS mailto: and send file as email
* Encryption

## Composer
* Bug (Regression): Modify name in Person popup: Input exits popup

### Editor
* First Enter keypress: newline, second Enter keypress: paragraph -  #35 DONE
* blockquote cite vs. third party
* Insert link
* Emojis

## Filters
* User manually moves mail into folder
  * -> Ask whether to keep doing that
  * -> create filter based on From address
* User searches manually
  * Button to save the search as Virtual folder
  * Button to create a filter action
    -> Use the search criteria as filter criteria
    -> Let user specify filter actions
* Filter actions
  * Move into folder
  * Delete
  * Mark as spam
  * Add tag
  * Redirect
* Run filters using Sieve or locally

## Security
* Unknown senders
  * Known name, but unknown email address
    * Warn when reading
    * Warn when replying
  * Score emails
    * Email address or domain name in name
    * Link text doesn't match link target
  * Make email domain bold, userpart in grey and not bold DONE
  * Remove email address and domain names from name DONE
  * Shorten name to 30 chars DONE
* HTML
  * Test sanitization
  * Make `<iframe>` untrusted and test it
  * Block HTTP loads
  * Show link target domain
* Promos
  * Link text doesn't match link target

## Conversation view
* Collapse specific emails (and save their collapsed state)
* Power user: Turn branches of a conversation into its own separate conversation
* Power user: Show branch structure (e.g. using indents)

## Later
* Refactor IMAP orchestration?: Separate IMAP protocol folder object and IMAP orcestration folder object. The latter does folder cache, IMAP poll/refresh, offline cache etc.

## Import
* Thunderbird
  * Account settings - DONE
  * Mails
  * Contacts - Partially implemented
  * Calendar
* Outlook
  * Account settings
  * Contacts
  * Calendar
  * Mails

# Later
* mailto handler
* WhatsApp
  * 1:1 chat
  * Group chat
  * Video conf
* Teams
  * 1:1 chat
  * Video conf
* SIP
  * Voice call to phone system
  * Incoming calls

## App logic
* init
  * Move chat account load into Chat app
* Router
  * Use Svelte router with objects stack?

## Power users
* Configurable hotkeys
* Scripts for Automation (Simple Addons?)
