# Next
* Mail
  * Bugs
    * Deleting wrong email
    * Sending wrong text
    * Person Popup opening automatically and focussing the name field
      * Close popup on enter or tab
    * Plaintext mail line wraps
    * HTML mail links: click and hover
  * OAuth2
  * Threads
    * Message: Conversation view
    * Message list: Threaded view?
    * Mail Chat view: Open thread
  * All accounts - fix
  * Setup mail
    * after account delete: remove general panel

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

# Apps
* Need: App shell, for: iframe rights

# Mail
* Body
  * Plaintext formatting
  * Link
    * Click
    * Hover
    * Right-click, copy
* Compose: Recipients entry
* Search
  * UI for criteria other than text
* Filter actions
* Virtual folders / Saved searches
  * Need: Fix observable collections for All Messages
* Removed emails
  * In SQL database
  * During fetch after login
  * From IDLE
  * Loop when deleting mail manually twice: FilteredCollection removed observers
* Autoconfig
  * Exchange AutoDiscover V2 and V1
  * Scrollbar for dialog box, not app window
* Forward & redirect
* Print
* View source
* Import
  * UI in Setup
  * Thunderbird
     * Account settings - Logic implemented
     * Mails
     * Contacts - Partial
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
  * Manually in settings
* Tags

### Later
* Refactor IMAP orchestration?: Separate IMAP protocol folder object and IMAP orcestration folder object. The latter does folder cache, IMAP poll/refresh, offline cache etc.
* JMAP

## Composer
* Add new email address and person from To: line

### Editor
* first enter: newline, second enter: paragraph
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

# Login
* OAuth2 UI

# Setup
* Read and save real name of user
* Chat & Video conf
* Combined: Mail, chat, fileshare, calendar, contacts with single login/setup

# Initial release
* Installer
  * Windows
  * Linux - DONE
  * Mac ARM - DONE
  * Auto-update client
  * Auto-update server
* Git repo
* Licenses
  * Adapt our Open-Source license
  * Adapt our EULA and Privacy policy
  * Impressum
* Password storage

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
