# Backend Architecture

The Mustang frontend is running in a browser context, using HTML, CSS,
JavaScript/TypeScript and Svelte. Most of our code lives there.

The browser context also runs a "logic" layer, which represents all the
"business logic" or core functions of the app. It is written entirely in
JavaScript/TypeScript, with no access to the UI at all.
(Therefore no HTML, CSS, nor Svelte, other than generic observables and stores.)
The "logic" connects to the frontend using APIs and observers.
Note that the "logic" layer is not the same as the "backend".

We need an additional application tier, what we call the "backend",
for a number of specific needs that cannot run in the frontend context:
* Access to TCP sockets
  * IMAP, POP3, SMTP, raw XMPP
* Access to files (on the user's computer)
  * Database file
  * Preferences/settings
  * File share syncing with a local directory
* Long-running blocking operations
  * Database access

For privacy reasons, we want the "backend" to run on the user's computer,
so that user emails hosted with third party providers are not routed through
our servers. (This is in contrast to many other current offers, including
the new Outlook, and many newer mail clients, which route
all user data through their servers.)

This document discussed where exactly the border between backend and logic is,
and on which level the API or protocol between them operates.
There are a number of options we have, and this document lists them and the
advantages and disadvantages.
We will then choose one of those options, discarding the others.

# Full backend (Option 1)

In this option, the backend contains the IMAP code, the database code, all the logic
code that connects them. The code that decides when to poll for mail, and when to
write mail into the local cache database, all lives in the backend.

The backend abstracts all these into a common API that is the same across all mail protocols, and transparently hides the local mail cache. The API simply allows to
get the folders and messages in the account, and offers an abstract observer API
to notify when new mails appear. As API basis, we will use Observable and observable
Collections.

We will use JPC for IPC/RPC and crossing the process border.

## Advantages

* Clear separation of responsibilities: Protocol implementations are clearly in the
  backend, including all code related to the protocol details and how to manage it.
* Clear contract: There is a clear, high-level API, independent of any protocol,
  as the boundary.
* Caching of mails stays local within the tier. This is good not only conceptually,
  but also avoids transferring the information multiple times across process 
  borders. A mail goes directly from IMAP fetch to database to file.

## Disadvantages

* Requires that the IPC/RPC mechanism can express the rich API that we expect.
* Means that a lot of our primary API becomes `async`, to be used with `await`.
* If done wrong, will require a lot of data transfers and back/forth over the
  process border, which is slow.
  * If object property access requires an RPC call, that means e.g. 5 times
    back/forth between the processes, just to read the 5 properties of a single
    object. That is going to be slow. So, we'd need some proactive sending of data 
    and caching to avoid that.
  * If we send too much data proactively, e.g. when sending a list of 100000 mails,
    then we are also slow, because of the amount of data sent, but not actually
    needed.
* Getting JPC (IPC/RPC) right is hard.
* JPC is not finished yet.

# Expose protocol libs (Option 2)

In this option, we run the IMAP protocol implementations in the "backend", but we
export the library API directly and unabstracted to the "logic" code, across the
process boundary.

Likewise, the database library runs either in the "backend" or in a WebWorker
(differnet JS thread) started by the frontend. The database library API is directly
exposed to the "logic" code.

The "logic" layer in the frontend process then contains the code that drives the
IMAP calls, sends mails to the database cache, and orcestrates everything. It is
the "logic" layer which contains the code that abstracts the different protocols
into a unified, abstract and logical API, with Observables and Collections.
Collections do not appear in the "backend" code at all.

## Advantages
* Avoids exposing our internal, rich and abstract API over the process boundary
  with JPC.
* There are far less IMAP library calls than there are calls to our API, so this may
  be a lot faster.
* The "logic" code would control the sqlite database code more directly, allowing
  us to make direct SQL queries without building abstraction layers.
* It keeps most of the logic code in one place, not spread over "backend"
  and "logic" layers.
* Our protocol abstractions are consistently in the "logic" code. Given that some
  protocol implementations for chat, video conference etc. are going to live in
  "logic" code anyways. Makes it far more consistent.

## Disadvantages
* IMAP fetch and database write needs to cross the process boundary twice.

## Subvariants

There are multiple ways how we can expose the protocol library API in the "backend"
to the "logic" code in the frontend. We need some sort of IPC, given that they
are in different processes.

### JPC (Option 2.1)

We use JPC to expose the backend functions to logic.

#### Advantages
* We control how it works. We can inspect it easily, and we can tune it.
* It's based on WebSockets and can therefore work with multiple architectures.
  The frontend can be Electron with Chrome, Firefox runner, or even a generic web
  browser.

#### Disavantages
* We have to write it, test it, ensure that it works well.
* JPC is not finished yet.

### Electron remote (Option 2.2)

Use Electron's built-in `remote` object and feature to expose backend JS APIs
to frontend code.

#### Advantages
* Easy to use
* Transparent
* Working

#### Disavantages
* Known to be slow
* Security: Must trust frontend code. XSS become more serious.
* Cannot change how it works. Unclear how it works, e.g. do object property
  reads make a cross-process call? (See above)
* Ties us to Electron

### Electron IPC (Option 2.3)

Use Electron's built-in `ipc` feature to facilitate the "backend" and "logic"
communication.

#### Advantages
* Successor of Electron `remote`. Supposedly doesn't have the security problems
  that Electron `remote` has.

#### Disavantages
* Doesn't have a JS API transparency layer. Need JPC on top of it.
* Ties us to Electron.

# Proxy TCP and file access (Option 3)

In this option, neither protocol implementation code, nor database code, lives
in the backend, but they are all in the frontend.

## Proxy TCP (Option 3A)

To allow the frontend to access TCP sockets, the backend code merely proxies
the channel. The frontend specifies the hostname and port and TLS variant,
and the proxy code sends the TCP data verbatim over a WebSocket or similar
channel that the frontend can access.

### Advantages
* All code, including IMAP protocol library, runs in the same place, the "logic".
* Low setup. Lightweight solution.
* Works for all TCP-based protocols.
* Fast and efficient: Only information that goes over the Internet crosses the
  process boundry.

### Disavantages
* More processing happens in the frontend, which may block the UI.
* Need to adapt the protocol implementation client libraries to use a custom
  TCP socket implementation. Most libs are written for node.js. They might have
  other dependencies on node.js, e.g. for Buffer, crypto code etc..

## File access via browser (Option 3B)

The database library (e.g. sqlite) runs in a WebWorker started from the frontend,
and access the database file using the
[`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) web API. To gain
access, we use either the
* [`FileSystem`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem) API
* File buckets
* or other Electron-/backend-specific tricks.

### Advantages
* No sqlite C compiling in Electron, which causes major headaches during install
  and deployment.

### Disavantages
* Limited to JS-based database engines that can run in the browser.
  E.g. sqlite as WASM.
* To avoid blocking the UI, need to run the database in a WebWorker,
  so still need some kind of RPC/IPC code, similar to when it runs in "backend".
* Difficult to access the right `File` object in the frontend.
