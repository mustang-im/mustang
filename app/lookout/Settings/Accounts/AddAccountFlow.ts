import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { AuthMethod } from "../../../logic/Abstract/Account";
import { TLSSocketType } from "../../../logic/Abstract/TCPAccount";
import { getStandardURL } from "../../../logic/Mail/AutoConfig/configInfo";
import { findConfig } from "../../../logic/Mail/AutoConfig/findConfig";
import { checkConfig } from "../../../logic/Mail/AutoConfig/checkConfig";
import { saveAndInitConfig, fillConfig } from "../../../logic/Mail/AutoConfig/saveConfig";
import { makeManualConfig } from "../../../logic/Mail/AutoConfig/manualConfig";
import { newAccountForProtocol } from "../../../logic/Mail/AccountsList/MailAccounts";
import { getOAuth2BuiltIn } from "../../../logic/Auth/OAuth2Util";
import { OAuth2 } from "../../../logic/Auth/OAuth2";
import { OAuth2Embed } from "../../../logic/Auth/UI/OAuth2Embed";
import { OAuth2UIMethod } from "../../../logic/Auth/UI/OAuth2UIMethod";
import type { SetupInstruction } from "../../../logic/Mail/AutoConfig/SetupInfo";
import { getDomainForEmailAddress } from "../../../logic/util/netUtil";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { AccountDraft, StandardPorts, type ServerDraft } from "./AccountDraft";
import { assert } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";
import type { ArrayColl } from "svelte-collections";

export enum AddAccountStep {
  EMailAddress = "email",
  Searching = "searching",
  Password = "password",
  Login = "login",
  Manual = "manual",
  Checking = "checking",
  Done = "done",
}

export class AddAccountFlow {
  step = AddAccountStep.EMailAddress;
  emailAddress = "";
  password = "";
  isManual = false;
  config: MailAccount | null = null;
  draft: AccountDraft | null = null;
  embed: OAuth2Embed | null = null;
  notice: string | null = null;
  isPrepared = false;
  readonly added: MailAccount[] = [];
  readonly preparedCount: number;
  protected readonly prepared: MailAccount[];
  protected abort = new AbortController();
  protected manualOutgoing: MailAccount["outgoing"] = null;
  protected manualOutgoingDraft: ServerDraft | null = null;

  constructor(prepared: MailAccount[] = []) {
    this.prepared = [...prepared];
    this.preparedCount = prepared.length;
    if (this.prepared.length) {
      this.startPrepared();
    }
  }

  get remainingPrepared(): number {
    return this.prepared.length;
  }

  get preparedNumber(): number {
    return this.preparedCount - this.prepared.length;
  }

  protected startPrepared() {
    let config = this.prepared.shift();
    this.config = config;
    this.draft = null;
    this.isPrepared = true;
    this.isManual = false;
    this.emailAddress = config.emailAddress;
    this.password = config.password ?? "";
    this.notice = null;
    this.step = config.authMethod == AuthMethod.OAuth2 && config.oAuth2 ? AddAccountStep.Login : AddAccountStep.Password;
  }

  skip() {
    this.embed?.abort();
    this.embed = null;
    this.config?.oAuth2?.abort();
    this.continueAfterAccount();
  }

  protected continueAfterAccount() {
    if (this.prepared.length) {
      this.startPrepared();
    } else if (this.added.length) {
      this.step = AddAccountStep.Done;
    } else {
      this.isPrepared = false;
      this.config = null;
      this.emailAddress = "";
      this.password = "";
      this.step = AddAccountStep.EMailAddress;
    }
  }

  get isEMailAddressValid(): boolean {
    return !!sanitize.emailAddress(this.emailAddress.trim(), null);
  }

  get domain(): string {
    return getDomainForEmailAddress(this.emailAddress.trim());
  }

  async connect(confirmRedirect: (emailAddress: string, redirectDomain: string) => Promise<boolean>) {
    assert(this.isEMailAddressValid, gt`Please enter a valid email address`);
    this.emailAddress = this.emailAddress.trim();
    this.notice = null;
    if (this.isManual) {
      this.startManual(null);
      return;
    }
    this.step = AddAccountStep.Searching;
    let configs: ArrayColl<MailAccount> | undefined;
    try {
      configs = await findConfig(this.emailAddress, this.password, confirmRedirect, this.abort);
    } catch (ex) {
      this.step = AddAccountStep.EMailAddress;
      throw ex;
    }
    if (!configs?.length) {
      if (!this.password) {
        this.config = null;
        this.notice = gt`Enter your password, so that we can ask the server of ${this.domain} for its settings.`;
        this.step = AddAccountStep.Password;
        return;
      }
      this.startManual(gt`We couldn't find the settings for ${this.domain}. Please enter them below.`);
      return;
    }
    this.config = configs.first;
    fillConfig(this.config, this.emailAddress, this.password);
    if (this.config.authMethod == AuthMethod.OAuth2) {
      this.config.oAuth2 ??= getOAuth2BuiltIn(this.config) as OAuth2;
      assert(this.config.oAuth2, gt`Could not find OAuth2 config for ${this.config.hostname}`);
      this.step = AddAccountStep.Login;
    } else {
      this.step = AddAccountStep.Password;
    }
  }

  get instructions(): SetupInstruction[] {
    return this.config?.setup?.instructions ?? [];
  }

  async submitPassword(confirmRedirect: (emailAddress: string, redirectDomain: string) => Promise<boolean>) {
    if (this.config) {
      await this.finish();
    } else {
      await this.connect(confirmRedirect);
    }
  }

  startManual(notice: string | null) {
    this.config = makeManualConfig(this.emailAddress, this.password);
    this.manualOutgoing = this.config.outgoing;
    this.draft = new AccountDraft(this.config);
    this.draft.realname ||= this.emailAddress.split("@")[0];
    this.notice = notice;
    this.step = AddAccountStep.Manual;
  }

  get usesURL(): boolean {
    return !!this.draft && !this.draft.incoming.usesHostname;
  }

  setAccountType(protocol: string) {
    if (!this.draft || this.config.protocol == protocol) {
      return;
    }
    let previous = this.draft;
    if (previous.outgoing) {
      this.manualOutgoingDraft = previous.outgoing;
    }
    let config = newAccountForProtocol(protocol);
    config.source = "manual";
    config.emailAddress = this.config.emailAddress;
    config.authMethod = previous.incoming.authMethod;
    config.tls = TLSSocketType.TLS;
    let isHostnameProtocol = protocol == "imap" || protocol == "pop3";
    config.outgoing = isHostnameProtocol ? this.manualOutgoing : null;
    if (!isHostnameProtocol) {
      config.url = getStandardURL(protocol, this.domain);
    }
    this.config = config;
    let draft = new AccountDraft(config);
    draft.realname = previous.realname;
    draft.emailAddress = previous.emailAddress;
    AddAccountFlow.copyServer(previous.incoming, draft.incoming);
    draft.incoming.port = StandardPorts.portFor(protocol, draft.incoming.tls) ?? draft.incoming.port;
    if (draft.outgoing && this.manualOutgoingDraft) {
      AddAccountFlow.copyServer(this.manualOutgoingDraft, draft.outgoing);
      draft.outgoing.port = this.manualOutgoingDraft.port;
    }
    if (!draft.incoming.usesHostname && draft.incoming.authMethod == AuthMethod.NTLM && protocol != "ews") {
      draft.incoming.authMethod = AuthMethod.Password;
    }
    this.draft = draft;
  }

  protected static copyServer(from: ServerDraft, to: ServerDraft) {
    if (from.usesHostname && to.usesHostname) {
      to.hostname = from.hostname;
      to.tls = from.tls;
    }
    to.username = from.username;
    to.password = from.password;
    to.authMethod = from.authMethod;
  }

  protected prepareURLAccount() {
    let config = this.config;
    // <copied from="../../../frontend/Settings/Mail/Manual/ManualConfigURL.svelte" onContinue()>
    assert(config.url, gt`Please enter the correct URL`);
    assert(config.url.startsWith("https://"), gt`URL must be https`);
    let hostname = new URL(config.url).hostname;
    // Office365 needs special handling
    if (hostname.endsWith(".office.com") || hostname.endsWith(".office365.com")) {
      config.authMethod = AuthMethod.OAuth2;
      if (config.protocol == "ews") {
        config.url = "https://outlook.office365.com/EWS/Exchange.asmx";
      } else if (config.protocol == "owa") {
        config.url = "https://outlook.office.com/owa/";
      } else if (config.protocol == "activesync") {
        config.url = "https://outlook.office365.com/Microsoft-Server-ActiveSync";
      }
    }
    let url = new URL(config.url);
    let path = url.pathname;
    if (config.protocol == "owa") {
      assert(path.toLowerCase().startsWith("/owa/"), gt`URL needs to contain /owa/`);
    }
    if (config.protocol == "ews") {
      if (path.toLowerCase().startsWith("/owa/")) {
        url.pathname = "/EWS/Exchange.asmx";
        config.url = url.href;
      }
    }
    config.tls = TLSSocketType.TLS;
    config.port = 443;
    config.hostname = new URL(config.url).hostname;
    if (config.authMethod == AuthMethod.OAuth2) {
      config.oAuth2 ??= getOAuth2BuiltIn(config) as OAuth2;
    }
    config.outgoing = null;
    // </copied>
  }

  async loginWithOAuth2() {
    let oAuth2 = this.config.oAuth2 as OAuth2;
    oAuth2.abort();
    let embed = new OAuth2Embed(oAuth2);
    this.embed = embed;
    try {
      let authCode = await embed.login();
      await oAuth2.getAccessTokenFromAuthCode(authCode);
      oAuth2.uiMethod = OAuth2UIMethod.Tab;
    } finally {
      if (this.embed == embed) {
        this.embed = null;
      }
    }
    await this.finish();
  }

  async finish() {
    if (this.step == AddAccountStep.Manual && this.draft) {
      let draft = this.draft;
      this.config.realname = draft.realname.trim();
      this.config.emailAddress = draft.emailAddress.trim();
      this.emailAddress = this.config.emailAddress;
      if (draft.outgoing) {
        draft.outgoing.username ||= draft.incoming.username;
        draft.outgoing.password ||= draft.incoming.password;
      }
      draft.incoming.apply();
      draft.outgoing?.apply();
      this.password = draft.incoming.password;
      if (this.usesURL) {
        this.prepareURLAccount();
        if (this.config.authMethod == AuthMethod.OAuth2) {
          assert(this.config.oAuth2, gt`Could not find OAuth2 config for ${this.config.hostname}`);
          this.step = AddAccountStep.Login;
          return;
        }
      }
    }
    this.step = AddAccountStep.Checking;
    try {
      await checkConfig(this.config, this.emailAddress, this.password);
    } catch (ex) {
      this.step = this.draft ? AddAccountStep.Manual : this.config.oAuth2 ? AddAccountStep.Login : AddAccountStep.Password;
      throw ex;
    }
    await saveAndInitConfig(this.config, this.emailAddress, this.password);
    this.added.push(this.config);
    this.continueAfterAccount();
  }

  cancel() {
    this.abort.abort();
    this.config?.oAuth2?.abort();
  }
}
