import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { AuthMethod } from "../../../logic/Abstract/Account";
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
  protected abort = new AbortController();

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
    this.draft = new AccountDraft(this.config);
    this.draft.realname ||= this.emailAddress.split("@")[0];
    this.notice = notice;
    this.step = AddAccountStep.Manual;
  }

  setAccountType(protocol: string) {
    if (!this.draft || this.config.protocol == protocol) {
      return;
    }
    let previous = this.draft;
    let config = newAccountForProtocol(protocol);
    config.source = "manual";
    config.emailAddress = this.config.emailAddress;
    config.authMethod = this.config.authMethod;
    config.tls = this.config.tls;
    config.outgoing = this.config.outgoing;
    this.config = config;
    let draft = new AccountDraft(config);
    draft.realname = previous.realname;
    draft.emailAddress = previous.emailAddress;
    AddAccountFlow.copyServer(previous.incoming, draft.incoming);
    draft.incoming.port = StandardPorts.portFor(protocol, draft.incoming.tls) ?? draft.incoming.port;
    if (previous.outgoing && draft.outgoing) {
      AddAccountFlow.copyServer(previous.outgoing, draft.outgoing);
      draft.outgoing.port = previous.outgoing.port;
    }
    this.draft = draft;
  }

  protected static copyServer(from: ServerDraft, to: ServerDraft) {
    to.hostname = from.hostname;
    to.username = from.username;
    to.password = from.password;
    to.tls = from.tls;
    to.authMethod = from.authMethod;
  }

  async loginWithOAuth2() {
    let oAuth2 = this.config.oAuth2 as OAuth2;
    oAuth2.abort();
    this.embed = new OAuth2Embed(oAuth2);
    try {
      let authCode = await this.embed.login();
      await oAuth2.getAccessTokenFromAuthCode(authCode);
      oAuth2.uiMethod = OAuth2UIMethod.Tab;
    } finally {
      this.embed = null;
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
    }
    this.step = AddAccountStep.Checking;
    try {
      await checkConfig(this.config, this.emailAddress, this.password);
    } catch (ex) {
      this.step = this.draft ? AddAccountStep.Manual : this.config.oAuth2 ? AddAccountStep.Login : AddAccountStep.Password;
      throw ex;
    }
    await saveAndInitConfig(this.config, this.emailAddress, this.password);
    this.step = AddAccountStep.Done;
  }

  cancel() {
    this.abort.abort();
    this.config?.oAuth2?.abort();
  }
}
