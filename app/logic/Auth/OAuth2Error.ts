export class OAuth2Error extends Error {
}

export class OAuth2LoginNeeded extends Error {
  constructor() {
    super("Please login");
  }
}

export class OAuth2ServerError extends OAuth2Error {
  details: any;
  consentRequired = false;
  constructor(json: any) {
    let msg = json?.error_description?.split(/[\r\n]/)[0].replace(/^\w+: /, "")
      ?? json?.error?.replace("_", " ")
      ?? "Login failed. Unknown OAuth2 error.";
    super(msg);
    // Microsoft
    const kErrorConsentRequiredEWS = 65001;
    const kErrorRedirectURLWrong = 700009;
    if (json.error_codes?.includes(kErrorConsentRequiredEWS)) {
      this.consentRequired = true;
    }
    if (json.error_codes?.includes(kErrorRedirectURLWrong)) {
      this.message = "Microsoft OAuth2: Redirect URL is wrong";
    }
    this.code = json.error;
    this.codes = json.error_codes;
    this.details = json;
    console.log("OAuth2 error", this, json);
  }
}
