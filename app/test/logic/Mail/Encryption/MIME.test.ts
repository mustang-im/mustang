import { parseHeaderParameters, parseMIMEDirectSubparts } from "../../../../logic/Mail/Encryption/MIME";
import { expect, test, describe } from "vitest";

describe("MIME header parameters", () => {
  test("are split off the header value", () => {
    let params = parseHeaderParameters(`multipart/signed; protocol="application/pgp-signature"; micalg=pgp-sha256; boundary=Foo42`);
    expect(params.$main).toBe("multipart/signed");
    expect(params.protocol).toBe("application/pgp-signature");
    expect(params.micalg).toBe("pgp-sha256");
    expect(params.boundary).toBe("Foo42");
  });

  test("type and parameter names are case-insensitive, but the values are not", () => {
    let params = parseHeaderParameters(` Multipart/Signed; BOUNDARY="MixedCase42"`);
    expect(params.$main).toBe("multipart/signed");
    expect(params.boundary).toBe("MixedCase42");
  });

  test("header without parameters", () => {
    expect(parseHeaderParameters("text/plain").$main).toBe("text/plain");
  });

  test("missing header", () => {
    expect(parseHeaderParameters(null).$main).toBe("");
  });

  test("parameter without a name is skipped", () => {
    let params = parseHeaderParameters(`text/plain; =nonsense; charset=utf-8`);
    expect(params.charset).toBe("utf-8");
  });
});

test("Multipart with a mixed-case Content-Type is split into its parts", () => {
  const contentType = `Multipart/Signed; PROTOCOL="application/pgp-signature"; BOUNDARY="abc"`;
  let mime = new TextEncoder().encode([
    `Content-Type: ${contentType}`,
    ``,
    `--abc`,
    `Content-Type: text/plain`,
    ``,
    `Hello`,
    `--abc`,
    `Content-Type: application/pgp-signature`,
    ``,
    `SIGNATURE`,
    `--abc--`,
    ``,
  ].join("\r\n"));
  let parts = parseMIMEDirectSubparts(mime, contentType);
  expect(parts.length).toBe(2);
  expect(parts[0]).toBe("Content-Type: text/plain\r\n\r\nHello");
  expect(parts[1]).toBe("Content-Type: application/pgp-signature\r\n\r\nSIGNATURE");
});
