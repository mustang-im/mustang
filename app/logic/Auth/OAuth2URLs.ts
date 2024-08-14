/**
 * Contains the hardcoded URLs for a handful of important providers,
 * including the client ID and secret.
 *
 * This is for legacy reasons. Going forward, we should use mAuth and
 * the client ID should be hardcoded ("messaging").
 *
 * This is essentially a JSON file, but allowing comments and trailing commas :).
 * It contains only data, no code.
 */
export const OAuth2URLs = [
  {
    domains: ["outlook.com", "outlook.office365.com", ],
    hostnames: ["outlook.office365.com", "outlook.office.com"],
    authURL: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    authDoneURL: "https://login.microsoftonline.com/common/oauth2/nativeclient",
    tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    tokenURLPasswordAuth: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
    logoutURL: "https://login.microsoftonline.com/common/oauth2/logout",
    scope: "offline_access https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/POP.AccessAsUser.All https://outlook.office.com/SMTP.Send",
    clientID: "1d01f7d4-334b-475a-9176-a0d504c6a38a",
    clientSecret: null,
    doPKCE: false,
  },
  {
    domains: ["google.com", "gmail.com", "googlemail.com" ],
    hostnames: ["imap.gmail.com", "smtp.gmail.com", "pop.gmail.com"],
    authURL: "https://accounts.google.com/o/oauth2/auth",
    tokenURL: "https://accounts.google.com/o/oauth2/token",
    logoutURL: "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost",
    scope: "https://mail.google.com/ https://www.googleapis.com/auth/carddav https://www.googleapis.com/auth/calendar",
    clientID: "592666826535-3ba3dp3eghj978d2r6nojihk699h9b4n.apps.googleusercontent.com",
    clientSecret: "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",
    doPKCE: false,
  },
  {
    domains: ["yahoo.com"],
    hostnames: ["imap.mail.yahoo.com", "pop.mail.yahoo.com", "smtp.mail.yahoo.com" ],
    authURL: "https://api.login.yahoo.com/oauth2/request_auth",
    tokenURL: "https://api.login.yahoo.com/oauth2/get_token",
    authDoneURL: "https://www.mustang.im/loggedin",
    logoutURL: "https://login.yahoo.com/account/logout?logout_all=1&src=app&.done=https%3A%2F%2Fwww.yahoo.com%2F",
    scope: "mail-w",
    clientID: "dj0yJmk9d25qSWNOMzJVeDhlJmQ9WVdrOVV6VTJiMjQzTTFZbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTE3",
    clientSecret: null,
    doPKCE: true,
  },
  {
    domains: ["aol.com"],
    hostnames: ["imap.aol.com", "pop.aol.com", "smtp.aol.com"],
    authURL: "https://api.login.aol.com/oauth2/request_auth",
    tokenURL: "https://api.login.aol.com/oauth2/get_token",
    authDoneURL: "https://www.mustang.im/loggedin",
    logoutURL: "https://login.aol.com/account/logout?logout_all=1&src=app&.done=https%3A%2F%2Fwww.aol.com%2F",
    scope: "mail-w",
    clientID: "dj0yJmk9Mm03clNTM3kyZ05WJmQ9WVdrOVNFeE9VelJ4UTFjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTBh",
    clientSecret: null,
    doPKCE: true,
  },
];
