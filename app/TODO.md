# Next
* Mail
  * Main window
    * Save window size
  * Setup
    * Default to vertical view
    * Manual config, remove [Save] button
    * EWS: Manual config with URL
  * Import
    * Contacts: TB address books
    * "Create more accounts" screen
  * OAuth2
    * Google approval
    * Yahoo registration
    * Microsoft - Partner support
  * Calendar
    * Change Date
    * Delete Event
    * Move to other calendar
  * Move messages to deep subfolders
    * Drag&Drop: Open on drag over
    * Popup dialog
  * Bug: Selection: Default selection on start
  * Inline images send
  * Move messages to other accounts
  * Import: Polish UI style
  * Threads
    * Search all folders
    * Hide quotes
    * Message list: Threaded view?
    * Mail Chat view: Open thread
  * Search
    * Saved searches - Edit
    * Actions (Filters)
      * Create
      * List
      * Edit
      * Run
  * Bugs: FastList doesn't update some rows #66
  * OAuth2: Popup dialog - for setup
  * All accounts
    * Fix mergeColls() #72
    * Use search folder
  * Setup mail
    * after account delete: remove general panel

# Polish
## Elena
* Clear profile
* Debug dump of settings
* Composer
  * PersonEntry: Delete key
  * Remove added attachment (needs menu item)
  * Open attachment
* Style
  * Contacts: Icon inner color in Dark mode
* Images, remote
* Saved Searches delete: Update list
* List view: Sort order
* MailChat/Thread: Jail HTML: Styles and size
* Calendar
  * Tuesday first day

# Initial release
* Installer
  * Mac Signing
  * Auto-update client
  * Auto-update test
* Beta notification bar
* Beta time-bomb
* License client
* Password storage

# UI
* Close menu when clicking outside menu

# Chat
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
* Store locally
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
* Body
  * Link: Right-click menu, copy
* Filter actions
* Virtual folders / Saved searches - DONE
* IMAP
  * UID vs. seq
  * modseq und CONDSTORE - implemented
* Removed emails
  * During fetch after login - FIXED?
  * Loop when deleting mail manually twice: FilteredCollection removed observers - FIXED?
* Autoconfig
  * Exchange AutoDiscover V2 and V1 - partially implemented
  * Scrollbar for dialog box, not app window
* Import
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
* Move folder
* Delete strategy
  * Move to trash
  * Expunge on quit
* Special folders
  * Better detection based on flags
  * Based on common names
  * Manually in settings - DONE
* Tags

## Missing features
* Filters / Actions
* Spam filter
* Tags
* Archive
* Undo
* Spellcheck
* Thread pane sort
* Threading in Thread pane
* Save/Load mail as .eml file
* Encryption

## Composer
* Add new email address and person from To: line

### Editor
* First Enter keypress: newline, second Enter keypress: paragraph -  #35 DONE
* blockquote cite vs. third party
* Insert link
* Insert image
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

## Later
* Refactor IMAP orchestration?: Separate IMAP protocol folder object and IMAP orcestration folder object. The latter does folder cache, IMAP poll/refresh, offline cache etc.
* JMAP

# Setup
* Chat & Video conf
* Combined: Mail, chat, fileshare, calendar, contacts with single login/setup

# Server
* Error logging server: Sentry
  * Error logging client

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
