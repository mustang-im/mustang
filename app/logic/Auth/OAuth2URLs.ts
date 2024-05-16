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
    authURL: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    authDoneURL: "https://login.microsoftonline.com/common/oauth2/nativeclient",
    tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    tokenURLPasswordAuth: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
    logoutURL: "https://login.microsoftonline.com/common/oauth2/logout",
    scope: "offline_access https://outlook.office365.com/.default",
    clientID: "5cf03223-8b81-4558-ae82-a8e31e66a889",
    clientSecret: null,
  },
  {
    domains: ["google.com", "gmail.com", "googlemail.com" ],
    authURL: "https://accounts.google.com/o/oauth2/auth",
    tokenURL: "https://accounts.google.com/o/oauth2/token",
    logoutURL: "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost",
    scope: "https://mail.google.com/ https://www.googleapis.com/auth/carddav https://www.googleapis.com/auth/calendar",
    clientID: "592666826535-3ba3dp3eghj978d2r6nojihk699h9b4n.apps.googleusercontent.com",
    clientSecret: "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",
  },
];
