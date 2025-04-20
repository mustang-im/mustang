// If you modify this file, please run:
// git update-index --assume-unchanged logins.ts

/** Test accounts
 * Format: As read by `Account.fromConfigJSON()` */
export const kMailAccounts = [
  {
    protocol: "imap",
    username: "test@example.com",
    password: "test",
    hostname: "imap.example.com",
    disabled: true,
  },
];
