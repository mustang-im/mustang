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
    scope: "offline_access https://outlook.office.com/.default",
    clientID: "5cf03223-8b81-4558-ae82-a8e31e66a889",
    clientSecret: null,
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
  },
  {
    domains: ["yahoo.com", "aol.com"],
    hostnames: ["imap.mail.yahoo.com", "pop.mail.yahoo.com", "smtp.mail.yahoo.com", "imap.aol.com", "pop.aol.com", "smtp.aol.com" ],
    authURL: "https://api.login.aol.com/oauth2/request_auth",
    tokenURL: "https://api.login.aol.com/oauth2/get_token",
    logoutURL: "https://login.yahoo.com/account/logout?logout_all=1&src=app&.done=https%3A%2F%2Fde.yahoo.com%2F",
    scope: "mail-w",
    clientID: "dj0yJmk9OEtIQ3ZpU3ZRMmlKJmQ9WVdrOWVqZGpVWEZuVTNBbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5",
    clientSecret: null,
  },
];
