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
    const kErrorConsentRequiredEWS = 65001;
    if (json.error_codes && json.error_codes.includes(kErrorConsentRequiredEWS)) {
      this.consentRequired = true;
    }
    this.details = json;
  }
}
