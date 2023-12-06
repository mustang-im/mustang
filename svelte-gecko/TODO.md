# App logic
* Errors
  * Notification bar
  * Accounts have .errors array for background errors, which UI subscribes to, and catch handlers add to.
* init
  * Create global init function, which inits appGlobal and then inits each app
  * Move chat account load into Chat app ini.
* Router
  * Allow app to change the screen
  * Contacts to chat, chat to contact etc.
  * Write mail

# UI
* flex independent from content
* Window header

# Chat
## UI
* Editor
  * HTML edit, to send HTML messages
  * Button toolbar
  * Emojis
  * Giffy
* Group chat
  * Need: Router, for: Click on name -> Contacts
  * Show list of participants?
  * Show number of participants
* Contact person
* Join group
  * Via group name or URL
  * Search
* Create group
* User is typing
* Link URLs
* Detect MarkDown in plaintext messages

# Editor
* Send HTML
* Formatting toolbar
* Detect MarkDown and convert to HTML while sending

## Matrix
* Message impl
  * Room title change
  * Person name chage
* Bug: Re-logins by itself

## Other protocols
* XMPP
* Signal?
* DIM <https://www.dim.chat>
* Find a suitable open protocol

# Contacts
* Placeholder when we have no image for a person

# Calendar
* New event dialog
* Protocol implementation
  * JMAP
  * JSCalendar
  * ical
* Store locally
* Invitation send
* Invitation receive
* Free/busy dialog

# Meet
## UI
* Meeting screen
* Start cam screen
* Need: Router, for: Showing incoming calls

## Protocol
* OpenTalk server
* Video streaming
* Jitsi server

## Later
* Teams
* WhatsApp

# Infra
* App shell: XULrunner, Electron etc.
* Cordova or similar
* node.js start and shutdown
* IPC: Communication to node.js process. Use jpc?

# Apps
* Need: App shell, for: iframe rights

# Mail
* Need: node.js, for: IMAP TCP, sqlite etc.
* Sqlite
* Refactor IMAP orcastration: Separate IMAP protocol folder object and IMAP orcestration folder object. The latter does folder cache, IMAP poll/refresh, offline cache etc.
* JMAP

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
