# Next
* Mail: Autoconfig
  * fillConfig for manual
  * Cancel button
  * Make it prettier
  * It's too high (I get a scrollbar)
  * Exchange AutoDiscover V2 and V1
  * Manual config
    * Port should be a combo box with common values (applicable for that selected protocol)
    * Put protocol IMAP/SMTP on the same line as "Incoming server" / "Outgoing server" (maybe) (would save height, and also be less overwhelming, because less lines in the form)
    * Outgoing next to incoming
* Mail: Attachments
* XMPP

# App logic
* Errors
  * Notification bar
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
* OpenTalk server
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
* Autoconfig
   * Manual config
   * Exchange AutoDiscover V2 and V1
   * Guess config
      * Needs: TCP stream from node.js backend
* Push mail / IDLE
   * New mail
   * Flag changes
   * Removed emails
* Removed emails, during fetch after login
* Display subfolders indented, as hierarchy
* Context menu for account, folder and message
  * Create subfolder
  * Close menu when clicking outside menu
* Save original emails as MIME in ZIP file
* Search
  * with/without text
  * within current folder / across all accounts and folders
* Filter actions
* Virtual folders / Saved searches
  * Need: Fix observable collections for All Messages
* View source
* Print
* Forward & redirect
* Test and fix body
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

# Login
* OAuth2 UI

# Setup
* Chat & Video conf
* Mail Autoconfig
* Combined: Mail, chat, fileshare, calendar, contacts with single login/setup

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

# Security
* Unknown senders
  * Shorten name to 30 chars
  * Remove email address and domain names from name
  * Make email domain bold, userpart in grey and not bold
  * Score emails:
    * Email address or domain name in name
    * Link text doesn't match link target
* Promos
    * Link text doesn't match link target

# Filters
* Move mail into folder -> Ask whether to keep doing that -> create filter based on From address
