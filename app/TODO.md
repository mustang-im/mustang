# Next
* Chat SQL - Test
* Mail
  * Server settings UI style
  * Folder context menu
  * Message list context menu
  * Threads
    * Message: Conversation view
    * Message list: Threaded view?
    * Mail Chat view: Open thread
  * Folder hierarchy
  * All accounts - fix
  * Bugs
    * Google
      * no email subject
    * Setup mail
      * When finishing gives error, don't allow the user to click multiple times, creating multiple accounts.
      * after account delete: remove general panel
# App logic
* init
  * Move chat account load into Chat app
* Router
  * Use Svelte router with objects stack?

# UI
* Window header

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
* UI for incoming or outgoing call
  * Before joining conference

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

# Infra
* App shell: XULrunner, Electron etc.
* Cordova or similar
* JPC: TCP sockets

# Apps
* Need: App shell, for: iframe rights

# Mail
* Display subfolders indented, as hierarchy
* Autoconfig
  * Exchange AutoDiscover V2 and V1
  * Scrollbar for dialog box, not app window
* Context menu for account and message
  * Move folder
  * Close menu when clicking outside menu
* Save original emails as MIME in ZIP file
* Search
  * with/without text
  * within current folder / across all accounts and folders
* Filter actions
* Virtual folders / Saved searches
  * Need: Fix observable collections for All Messages
* Removed emails
  * In SQL database
  * During fetch after login
  * From IDLE
  * Loop when deleting mail manually twice: FilteredCollection removed observers
* View source
* Print
* Forward & redirect
* Import
  * Thunderbird
     * Account settings
     * Mails
     * Contacts
     * Calendar
  * Outlook
     * Account settings
     * Contacts
     * Calendar
     * Mails
* HTML emails as sent, but sanitized and jailed
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
  * Shorten name to 30 chars
  * Remove email address and domain names from name
  * Make email domain bold, userpart in grey and not bold
  * Score emails:
    * Email address or domain name in name
    * Link text doesn't match link target
* Promos
    * Link text doesn't match link target

# Login
* OAuth2 UI

# Setup
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
