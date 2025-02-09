import type { OAuth2 } from "./OAuth2";
import { Observable } from "../util/Observable";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { ensureArray, assert, type URLString } from "../util/util";

/**
 * Implements OpenID Connect, but only the parts that are not already implemented
 * by the `OAuth2` class, specifically:
 * - Decoding of the ID Token
 */
export class OpenIDConnect extends Observable {
  static decodeIDToken(idTokenEncoded: string, oAuth2: OAuth2): OpenIDConnectIDToken {
    let parts = idTokenEncoded.split('.');
    // let header = atob(parts[0]);
    let payload = atob(parts[1]);
    let claims = JSON.parse(payload);
    console.log("ID Token claims", claims);
    assert(claims.typ == "ID", "ID Token has the wrong type");
    assert(sanitize.nonemptystring(claims.iss, null), "ID Token is missing the Issuer");
    assert(sanitize.nonemptystring(claims.email, null), "ID Token is missing the email address");
    let id: OpenIDConnectIDToken = {
      issuer: sanitize.nonemptystring(claims.iss),
      subject: sanitize.nonemptystring(claims.sub),
      audience: ensureArray(claims.aud).map(aud => sanitize.nonemptystring(aud)),
      expiresAt: sanitize.date(claims.exp * 1000),
      issuedAt: sanitize.date(claims.iat * 1000),
      emailAddress: sanitize.nonemptystring(claims.email),
      emailAddressVerified: sanitize.boolean(claims.email_verified, false),
      name: sanitize.nonemptystring(claims.name, null),
      firstName: sanitize.nonemptystring(claims.given_name, null),
      lastName: sanitize.nonemptystring(claims.family_name, null),
      claims: claims,
    };
    // <https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation>
    assert(!id.audience.length || id.audience.find(aud => aud == oAuth2.clientID), "ID Token audience doesn't match our client ID");
    // assert(id.issuer == oAuth2.issuer, "ID Token issuer doesn't match");
    // Can't check expiry time, because we cannot compare client time with server time:
    // The user's clock might not be set correctly (clock drift, wrong timezone, or nobody set it).
    return id;
  }
}

/** @see https://openid.net/specs/openid-connect-core-1_0.html#IDToken */
export type OpenIDConnectIDToken = {
  issuer: string;
  subject: string;
  audience: string[];
  expiresAt: Date;
  issuedAt: Date;
  emailAddress: string;
  emailAddressVerified: boolean;
  name: string;
  firstName: string;
  lastName: string;
  claims: Record<string, any>;
}
