import { AuthMethod, MailAccount, OutgoingMailAccount, TLSSocketType } from "../../MailAccount";
import { SMTPAccount } from "../../SMTP/SMTPAccount";
import { EWSAccount } from "../../EWS/EWSAccount";
import { IMAPAccount } from "../../IMAP/IMAPAccount";
import { POP3Account } from "../../POP3/POP3Account";
import { MailIdentity } from "../../MailIdentity";
import { newAccountForProtocol } from "../../AccountsList/MailAccounts";
import { kStandardPorts } from "../../AutoConfig/configInfo";
import { appGlobal } from "../../../app";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { arrayRemove, assert, NotReached } from "../../../util/util";
import { parse as parseINI } from 'ini';

/** Finds the list of Thunderbird profiles of the current OS user,
 * with the directory root path of the profile. */
export class ThunderbirdProfile {
  name: string;
  /** The root directory of the TB profile, e.g. /home/USER/.thunderbird/dfhdhdh.default/ */
  path: string;
  relativePath: string;
  isDefault: boolean;
  isLocked: boolean;
  isRelative: boolean;
  /** key = pref name, e.g. "mail.foo" value: pref value, e.g. 993, true, or "imap.example.com" */
  prefs: Record<string, any>;

  async readAccounts(): Promise<MailAccount[]> {
    let accounts: MailAccount[] = [];
    await this.readPrefs();
    let accountIDs = sanitize.stringOrNull(this.prefs["mail.accountmanager.accounts"])?.split(",");
    assert(accountIDs && accountIDs.length, "  No accounts found for " + this.path);

    for (let accountID of accountIDs) {
      let account = this.readAccount(accountID);
      if (account) {
        accounts.push(account);
      }
    }

    // Make default account the first in the array
    let defaultAccountName = this.prefs["mail.accountmanager.defaultaccount"];
    if (defaultAccountName) {
      let defaultAccount = accounts.find(acc => acc.id == "tb-" + defaultAccountName);
      if (defaultAccount) {
        arrayRemove(accounts, defaultAccount);
        accounts.unshift(defaultAccount);
      }
    }

    return accounts;
  }

  readAccount(accountID: string): MailAccount | null {
    try {
      let prefBranch = `mail.account.${accountID}`;
      console.log("  reading", accountID);
      let serverID = this.prefs[`${prefBranch}.server`];
      let protocol = sanitize.enum(this.prefs[`mail.server.${serverID}.type`], ["imap", "pop3", "exchange", "exquilla"], null);
      if (!protocol || protocol == "none") {
        return null;
      } else if (protocol == "exquilla") {
        protocol = "ews";
      } else if (protocol == "exchange") {
        // TODO owl, owl-ews or owl-eas?
        protocol = "ews";
      }
      let acc = newAccountForProtocol(protocol);
      console.log("  protocol", protocol);
      acc.id = "tb-" + accountID;
      this.readServer(serverID, acc);
      let identityIDs = this.prefs[`${prefBranch}.identities`]?.split(",");
      acc.identities.addAll(identityIDs.map(id => this.readIdentity(id, acc)));
      assert(acc.outgoing, "SMTP server missing for account " + accountID);
      assert(acc.identities.hasItems, "Identities missing for account " + accountID);
      return acc;
    } catch (ex) {
      console.error(ex); // TODO disable errors in production
      return null;
    }
  }

  readServer(serverID: string, acc: MailAccount): void {
    let prefBranch = `mail.server.${serverID}`;
    acc.name = sanitize.label(this.prefs[`${prefBranch}.name`]);
    acc.username = sanitize.stringOrNull(this.prefs[`${prefBranch}.userName`]);
    if (acc instanceof EWSAccount) {
      acc.url = sanitize.url(this.prefs[`${prefBranch}.ewsURL`]);
    } else if (acc instanceof IMAPAccount || acc instanceof POP3Account) {
      acc.hostname = sanitize.hostname(this.prefs[`${prefBranch}.hostname`]);
      acc.tls = ThunderbirdProfile.convertTLS(this.prefs[`${prefBranch}.socketType`], prefBranch);
      acc.port = ThunderbirdProfile.convertPort(this.prefs[`${prefBranch}.port`], acc as any as MailAccount);
      acc.authMethod = ThunderbirdProfile.convertAuthMethod(this.prefs[`${prefBranch}.authMethod`]);
    } else {
      throw new NotReached();
    }
  }

  readIdentity(identityID: string, account: MailAccount): MailIdentity | null {
    try {
      let identity = new MailIdentity();
      identity.id = "tb-" + identityID;
      let prefBranch = `mail.identity.${identityID}`;
      assert(this.prefs[`${prefBranch}.valid`] !== false, "Identity marked as invalid");
      identity.userRealname = this.prefs[`${prefBranch}.fullName`];
      identity.emailAddress = this.prefs[`${prefBranch}.useremail`];
      let signatureHTML = this.prefs[`${prefBranch}.htmlSigText`];
      if (signatureHTML) {
        if (this.prefs[`${prefBranch}.htmlSigText`] === false) {
          signatureHTML = `<pre>${signatureHTML}</pre>`;
        }
        identity.signatureHTML = signatureHTML;
      }

      if (!account.outgoing) {
        let id = this.prefs[`${prefBranch}.smtpServer`];
        let server = this.readSMTPServer(id, account);
        if (server) {
          account.outgoing = server as any as MailAccount & OutgoingMailAccount;
        }
      }
      return identity;
    } catch (ex) {
      console.error(ex); // TODO disable errors in production
      return null;
    }
  }

  readSMTPServer(serverID: string, account: MailAccount): SMTPAccount | null {
    try {
      let acc = new SMTPAccount();
      acc.id = "tb-" + acc.id + "-smtp";
      let prefBranch = `mail.smtpserver.${serverID}`;
      acc.hostname = this.prefs[`${prefBranch}.hostname`];
      acc.username = this.prefs[`${prefBranch}.username`];
      acc.tls = ThunderbirdProfile.convertTLS(this.prefs[`${prefBranch}.try_ssl`], prefBranch);
      acc.port = ThunderbirdProfile.convertPort(this.prefs[`${prefBranch}.port`], acc as any as MailAccount);
      acc.authMethod = ThunderbirdProfile.convertAuthMethod(this.prefs[`${prefBranch}.authMethod`]);
      return acc;
    } catch (ex) {
      console.error(ex); // TODO disable errors in production
      return null;
    }
  }

  static convertTLS(tbValue: number, prefBranch: string): TLSSocketType {
    // nsMsgSocketType <https://searchfox.org/comm-central/source/mailnews/base/public/MailNewsTypes2.idl#40>
    let tls = sanitize.translate(tbValue, {
      0: TLSSocketType.Plain,
      1: TLSSocketType.STARTTLS,
      2: TLSSocketType.STARTTLS,
      3: TLSSocketType.TLS,
    }, null);
    try {
      assert(tls, "Need socketType for server " + prefBranch + ", got " + tbValue + " "+ typeof tbValue);
    } catch (ex) { console.log(ex.message) }
    return tls;
  }

  static convertAuthMethod(tbValue: number): AuthMethod {
    // nsMsgSocketType <https://searchfox.org/comm-central/source/mailnews/base/public/MailNewsTypes2.idl#60>
    let authMethod = sanitize.translate(tbValue, {
      0: AuthMethod.Password, // No auth at all, but let's try password
      2: AuthMethod.Password, // "old" = IMAP Login
      3: AuthMethod.Password, // Cleartext Password
      4: AuthMethod.Password, // AuthMethod.CRAMMD5, but not yet supported
      5: null, // Kerberos, not yet supported
      6: AuthMethod.Password, // AuthMethod.NTLM, but not yet supported
      7: null, // External = SSL client cert, but not supported
      8: AuthMethod.Password, // "Secure", deprecated
      9: AuthMethod.Password, // anything
      10: AuthMethod.OAuth2,
    }, null);
    assert(authMethod, "Need authMethod");
    return authMethod;
  }

  static convertPort(tbValue: number, acc: MailAccount): number {
    return sanitize.portTCP(tbValue ??
      kStandardPorts.find(p => p.protocol == acc.protocol && p.tls == acc.tls)?.port);
  }

  /** Result is in `this.prefs` */
  async readPrefs(): Promise<void> {
    let prefsPath = await appGlobal.remoteApp.path.join(this.path, "prefs.js");
    //console.log(`Looking for Thunderbird prefs.js at ${prefsPath}`);
    let prefsText = await appGlobal.remoteApp.fs.readFile(prefsPath, { encoding: "utf-8" });
    let prefsLines = prefsText.split("\n"); // TODO LF?
    let prefs = {};
    for (let line of prefsLines) {
      if (!(line.startsWith(`user_pref("`) && line.includes(`", "`) && line.endsWith(`");`))) {
        continue;
      }
      let nameVal = line.slice(11, -3).split(`", "`);
      if (nameVal.length != 2) {
        continue;
      }
      let [name, value] = nameVal;
      let number = parseInt(value); // convert integers
      if (!isNaN(number)) {
        value = number;
      } else if (value == "true" || value == "false") { // convert booleans
        value = value == "true";
      } else if (typeof (value) == "string") {
        value = value.replace(/\\"/g, `"`).replace(/\\n/g, `\n`); // unescape
      }
      prefs[name] = value;
    }
    this.prefs = prefs;
  }

  static async findProfiles(): Promise<ThunderbirdProfile[]> {
    let baseDir = await this.baseDir();
    let iniPath = await appGlobal.remoteApp.path.join(baseDir, "profiles.ini");
    let iniText = await await appGlobal.remoteApp.fs.readFile(iniPath, { encoding: "utf-8" });
    let iniContents = parseINI(iniText);
    let profiles: ThunderbirdProfile[] = [];
    /*
    [Profile97]
    Name=somename
    Path=i5fo43qd.somename
    IsRelative=1
    Locked=1
    */
    for (let sectionName in iniContents) {
      try {
        let section = iniContents[sectionName];
        if (sectionName.startsWith("Profile")) {
          //console.log("section", section);
          let profile = new ThunderbirdProfile();
          profile.name = sanitize.nonemptystring(section.Name);
          profile.relativePath = sanitize.nonemptystring(section.Path);
          profile.isRelative = section.IsRelative == "1";
          profile.isLocked = section.Locked == "1";
          profile.isDefault = section.IsDefault == "1";
          if (profile.isRelative) {
            profile.path = await appGlobal.remoteApp.path.join(baseDir, profile.relativePath);
          } else {
            profile.path = profile.relativePath;
          }
          profiles.push(profile);
        }
      } catch (ex) {
        console.error(ex);
      }
    }
    /*
    [Install599705D84171D0F]
    Default = i5fo43qd.somename
    */
    for (let sectionName in iniContents) {
      try {
        let section = iniContents[sectionName];
        if (!sectionName.startsWith("Install")) {
          continue;
        }
        let path = sanitize.stringOrNull(section.Default);
        if (!path) {
          continue;
        }
        let profile = profiles.find(p => p.relativePath == path);
        if (!profile) {
          continue;
        }
        profile.isDefault = true;
      } catch (ex) {
        console.error(ex);
      }
    }
    return profiles;
  }
  static async baseDir(): Promise<string> {
    /*
    Win10: C:\Users\USER\AppData\Roaming\Thunderbird\Profiles\
    Mac OS X: /Users/USER/Library/Thunderbird/Profiles/
    Linux: /home/USER/.thunderbird/
    https://support.mozilla.org/de/kb/Benutzerprofile-Thunderbird#thunderbird:win10:tb115
    https://support.mozilla.org/de/kb/Benutzerprofile-Thunderbird#thunderbird:mac:tb115
    https://support.mozilla.org/de/kb/Benutzerprofile-Thunderbird#thunderbird:linux:tb115
    */
    let homedir = await appGlobal.remoteApp.homedir();
    let platform = await appGlobal.remoteApp.platform();
    let subdir =
      platform == "darwin" ? "Library/Thunderbird/Profiles" :
        platform == "win32" ? "Thunderbird/Profiles" :
          ".thunderbird";
    return await appGlobal.remoteApp.path.join(homedir, subdir);
  }
}
