/**
 * `openssl smime -sign`, self-signed certificate for alice@example.com.
 * Stored with LF, but S/MIME digests the signed part with CRLF.
 */

/** Detached signature */
export const kClearSigned = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Signed test
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-clearsigned@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/x-pkcs7-signature"; micalg="sha-256"; boundary="----3120AE5FA6844B38B313D9FF5848BBF0"

This is an S/MIME signed message

------3120AE5FA6844B38B313D9FF5848BBF0
Content-Type: text/plain; charset=utf-8

Hello, this is signed.

------3120AE5FA6844B38B313D9FF5848BBF0
Content-Type: application/x-pkcs7-signature; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

MIIF/wYJKoZIhvcNAQcCoIIF8DCCBewCAQExDzANBglghkgBZQMEAgEFADALBgkq
hkiG9w0BBwGgggNnMIIDYzCCAkugAwIBAgIUfLidH6m2LO9clZgJa3mGY4sD/wYw
DQYJKoZIhvcNAQELBQAwMjEOMAwGA1UEAwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEW
EWFsaWNlQGV4YW1wbGUuY29tMB4XDTI2MDgzMTIwMTYyOVoXDTM2MDgyODIwMTYy
OVowMjEOMAwGA1UEAwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1w
bGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4Ykz+s5L2LiX
UyiBZTfybeec0S7wBjoznt3WfOJYCPTtwHLcg7CXpFWrOxkeG4zzwSvfXfFGrocN
fq9hedKtdDnj2QLNi4wyG3BdSM1SAheqVCy8EDk3hEm4nZW2MF9w4EDrxMD6ZCCz
wsz0WJJrRW0hoED3Ym/sfbVIBlzThxKs+0c+uMIkH86CsNuxbqbgakwsZypF/c2B
zyzAe9lEGV4YfJ0tpBaVs8/xz16bIfidlAIdK3TGr1szBMGLpf4CenAb2PGpM6c7
i3sj1DcNAAMGPYKZPgpBkYkIJYcgs5ObJjBrQBQ+yEO0IUmCwP60eGTfnN2bvLj5
11hIjZ5xAQIDAQABo3EwbzAdBgNVHQ4EFgQU+hF3e+nTileR9TLiAmyGZ/VKYm4w
HwYDVR0jBBgwFoAU+hF3e+nTileR9TLiAmyGZ/VKYm4wDwYDVR0TAQH/BAUwAwEB
/zAcBgNVHREEFTATgRFhbGljZUBleGFtcGxlLmNvbTANBgkqhkiG9w0BAQsFAAOC
AQEAzAmKAPYFqzr6O2BWAl8q+KOS9x2X3Nhchx1uc0sBDwwBRDJh4gsYINAnFmhj
I/sIzCu07Qf1YU3V/MoyK+b02Psn8sA/mBBZwV+4HtiyMBmanBczo6x+hB+BujLp
5RAYi8NmE0ZGO0JCXS4/Cm4Zu5idaEgNbZ9lP35V77TBvu1KXQ0VdIpjP+CDwveo
iHdQzvQH8EJNXtRtK3/doWAlIrrqZ0WsnywJCKV6QbnNMNtdxk1vMBtE6TcN7u91
qtnBZoGd85tXnDH3D5tqD/ewSf6DqPpAWx4JBX6FbTHGLl53Md+hoMn8I4e1TYk1
rjkQXv3AbCSD6BaVmBnz6YWRFTGCAlwwggJYAgEBMEowMjEOMAwGA1UEAwwFQWxp
Y2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1wbGUuY29tAhR8uJ0fqbYs71yV
mAlreYZjiwP/BjANBglghkgBZQMEAgEFAKCB5DAYBgkqhkiG9w0BCQMxCwYJKoZI
hvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNjA4MzEyMDIwMTJaMC8GCSqGSIb3DQEJ
BDEiBCBQzaSaun1Wlef9HLKuhS5x8W/aQ79/4wlWOmQd3ZkSuDB5BgkqhkiG9w0B
CQ8xbDBqMAsGCWCGSAFlAwQBKjALBglghkgBZQMEARYwCwYJYIZIAWUDBAECMAoG
CCqGSIb3DQMHMA4GCCqGSIb3DQMCAgIAgDANBggqhkiG9w0DAgIBQDAHBgUrDgMC
BzANBggqhkiG9w0DAgIBKDANBgkqhkiG9w0BAQEFAASCAQCx61bQ/sXYqIZ5Hvmr
uzoctoBVNkrbjfADFnSw+mA00TNyYaPEk4jeY0zlQvL8WyFeRgUaYY1QrnldRuPk
+7Ic3/eYwMbVVy5ft8cX8IfivZqtMZOIk10aZkLuTaahERNVcsNGCHNLmqJUQBP6
AjrrIO+J+i1NYwh60JFHd7/67W59CQbo4vGQlAmDB9e8ry9rfvowJ0F0NHbUkZSo
GNqws29ISJL1A6XK19Rw1HdmyQzL6j0Hd9JFfY4eCCMrq52/h+PMjQoCJxeYnkcD
jFbTHJf79sto/yoPwvlgQBN1lqfGQU556gpWtRJMPp3RfFiaTDzPFAzLQAmEP8mM
T1ku

------3120AE5FA6844B38B313D9FF5848BBF0--

`;

/** `-nodetach`, i.e. the message is inside the CMS blob */
export const kOpaqueSigned = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Signed test
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-opaque@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/x-pkcs7-mime; smime-type=signed-data; name="smime.p7m"
Content-Transfer-Encoding: base64

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
Cla1Ekw+ndF8WJpMPM8UDMtACYQ/yYxPWS4=

`;

/**
 * Bare LF line endings, inside and out, as NSS writes them: the signature
 * is over the LF bytes of the signed part, so the reader must not convert
 * them. Thunderbird's own test messages look like this.
 * `openssl cms -sign -binary -in part.txt -signer alice.crt -inkey alice.key
 *   -outform DER`, where `part.txt` is the text/plain part below,
 * with LF endings and without a trailing newline.
 */
export const kClearSignedLF = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Signed with LF line endings
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-lf@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-256"; boundary="----LF74A9C1D0E5B34F2A9C8E1D6B3A5F7E20"

This is an S/MIME signed message

------LF74A9C1D0E5B34F2A9C8E1D6B3A5F7E20
Content-Type: text/plain; charset=utf-8

Hello, this is signed.
------LF74A9C1D0E5B34F2A9C8E1D6B3A5F7E20
Content-Type: application/pkcs7-signature; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

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
------LF74A9C1D0E5B34F2A9C8E1D6B3A5F7E20--`;

/**
 * The signature part with the generic file type that Microsoft uses and
 * that gateways rewrite to. MS-OXOSMIME section 2.2.1
 * `openssl cms -sign -in part.txt -signer alice.crt -inkey alice.key
 *   -outform SMIME -md sha256`, with the Content-Type of the signature
 * part replaced by `application/octet-stream; name="smime.p7s"`.
 */
export const kClearSignedOctetStream = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Signed, signature delivered as a file
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-octet@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-256"; boundary="----72D4E9ED7779F5B28FF1B7EC321EEE7F"

This is an S/MIME signed message

------72D4E9ED7779F5B28FF1B7EC321EEE7F
Content-Type: text/plain; charset=utf-8

Hello, this is signed.

------72D4E9ED7779F5B28FF1B7EC321EEE7F
Content-Type: application/octet-stream; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

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

------72D4E9ED7779F5B28FF1B7EC321EEE7F--`;

/* Clear-signed with an EC certificate, as Thunderbird and Apple Mail sign
 * when the user's key is on a NIST curve, and as many European CAs issue.
 * One message per curve, each with the hash that goes with it:
 * openssl ecparam -name prime256v1 -genkey -noout -out ec256.key
 * openssl req -x509 -key ec256.key -sha256 -days 3650 -out ec256.crt \
 *   -subj "/CN=EC Alice/emailAddress=ec256@example.com" \
 *   -addext "subjectAltName=email:ec256@example.com"
 * printf 'Content-Type: text/plain; charset=utf-8\n\nHello, this is signed.' > body.txt
 * openssl cms -sign -signer ec256.crt -inkey ec256.key -md sha256 \
 *   -in body.txt -outform SMIME
 * The other two use -name secp384r1 with -sha384/-md sha384,
 * and -name secp521r1 with -sha512/-md sha512. */

/** ECDSA on P-256, with SHA-256 */
export const kECClearSigned256 = `From: EC Alice <ec256@example.com>
To: User <user@example.com>
Subject: Signed test
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-ec256@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-256"; boundary="----60FAF574DFE81B5AAEE8865E94E6AD85"

This is an S/MIME signed message

------60FAF574DFE81B5AAEE8865E94E6AD85
Content-Type: text/plain; charset=utf-8

Hello, this is signed.
------60FAF574DFE81B5AAEE8865E94E6AD85
Content-Type: application/pkcs7-signature; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

MIIDugYJKoZIhvcNAQcCoIIDqzCCA6cCAQExDTALBglghkgBZQMEAgEwCwYJKoZI
hvcNAQcBoIIB4TCCAd0wggGDoAMCAQICFEreUJcDmeUDVrgXHxZ6FMwyFQT+MAoG
CCqGSM49BAMCMDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFl
YzI1NkBleGFtcGxlLmNvbTAeFw0yNjA5MDMwNjI3MDZaFw0zNjA4MzEwNjI3MDZa
MDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFlYzI1NkBleGFt
cGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABDp2hTMhlULocs5hP+VR
mo+C7nbDxTGP0ctmNJ9Hf/Qtz54hy1ftvWSKZfGvAzgwVT+tcOjtBYJLWuE2izhV
pV2jcTBvMB0GA1UdDgQWBBRuG1E8SoaTpWs5YHmdQlQ71tG8hDAfBgNVHSMEGDAW
gBRuG1E8SoaTpWs5YHmdQlQ71tG8hDAPBgNVHRMBAf8EBTADAQH/MBwGA1UdEQQV
MBOBEWVjMjU2QGV4YW1wbGUuY29tMAoGCCqGSM49BAMCA0gAMEUCIQCCw6rJ9E+5
9/Vk6CQMYGxaPpailreX2okvAVCU8b51sgIgKv0lIHddHmK8zxjrs0EEWv1eI2Bj
zgBkPDZ4WWwPxVYxggGfMIIBmwIBATBNMDUxETAPBgNVBAMMCEVDIEFsaWNlMSAw
HgYJKoZIhvcNAQkBFhFlYzI1NkBleGFtcGxlLmNvbQIUSt5QlwOZ5QNWuBcfFnoU
zDIVBP4wCwYJYIZIAWUDBAIBoIHkMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEw
HAYJKoZIhvcNAQkFMQ8XDTI2MDkwMzA2MjcwN1owLwYJKoZIhvcNAQkEMSIEINoX
U0VI6VFWlk73pplSr5kR1/uHPr8UIz3oO6+QsHDDMHkGCSqGSIb3DQEJDzFsMGow
CwYJYIZIAWUDBAEqMAsGCWCGSAFlAwQBFjALBglghkgBZQMEAQIwCgYIKoZIhvcN
AwcwDgYIKoZIhvcNAwICAgCAMA0GCCqGSIb3DQMCAgFAMAcGBSsOAwIHMA0GCCqG
SIb3DQMCAgEoMAoGCCqGSM49BAMCBEcwRQIhAIDyNN/JlvRTvJZh9yJJ/KaRaDOF
q+YEfluAH6euDc/BAiBC9UEq+sz+DoWsZchYFN60MOhw4vXP72mfuuOeDHaSEQ==

------60FAF574DFE81B5AAEE8865E94E6AD85--

`;

/** ECDSA on P-384, with SHA-384 */
export const kECClearSigned384 = `From: EC Alice <ec384@example.com>
To: User <user@example.com>
Subject: Signed test
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-ec384@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-384"; boundary="----25E51055B53B71BB24C715CC4466A099"

This is an S/MIME signed message

------25E51055B53B71BB24C715CC4466A099
Content-Type: text/plain; charset=utf-8

Hello, this is signed.
------25E51055B53B71BB24C715CC4466A099
Content-Type: application/pkcs7-signature; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

MIIEKAYJKoZIhvcNAQcCoIIEGTCCBBUCAQExDTALBglghkgBZQMEAgIwCwYJKoZI
hvcNAQcBoIICHjCCAhowggGgoAMCAQICFBztuvaZR4Hhf1N78JpFG7o/qUiCMAoG
CCqGSM49BAMDMDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFl
YzM4NEBleGFtcGxlLmNvbTAeFw0yNjA5MDMwNjI3MDZaFw0zNjA4MzEwNjI3MDZa
MDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFlYzM4NEBleGFt
cGxlLmNvbTB2MBAGByqGSM49AgEGBSuBBAAiA2IABAqzRCFv9cPCl9mNFvoj53Vd
AeTpWZ068vnamuqLGPxVy1NI2eEn5K8+syU4LAu/wQNxpfMwdhnM2JwyJqAYgv/d
WW40KrX0diynyflRSwILtjFuf+mQMc99N4L3p6HYzqNxMG8wHQYDVR0OBBYEFALX
shbusFFTuBXeI7plX7IJQSp/MB8GA1UdIwQYMBaAFALXshbusFFTuBXeI7plX7IJ
QSp/MA8GA1UdEwEB/wQFMAMBAf8wHAYDVR0RBBUwE4ERZWMzODRAZXhhbXBsZS5j
b20wCgYIKoZIzj0EAwMDaAAwZQIxAIUDKWmRQ27iTp6AKQVCoEWUQZXo6LAHDjDM
vFAGzKqAypuBBPxhZeiEs3HAJggeEAIwRKVNFWMmx8dtmBKl8n2dL+QKU2v4qdVy
9J776wiQiZ5gv2xpDnHY3UyNwNWRmgwtMYIB0DCCAcwCAQEwTTA1MREwDwYDVQQD
DAhFQyBBbGljZTEgMB4GCSqGSIb3DQEJARYRZWMzODRAZXhhbXBsZS5jb20CFBzt
uvaZR4Hhf1N78JpFG7o/qUiCMAsGCWCGSAFlAwQCAqCB9DAYBgkqhkiG9w0BCQMx
CwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNjA5MDMwNjI3MDdaMD8GCSqG
SIb3DQEJBDEyBDDptjzglRziurbIV5C6jbHU48uyR4JfjSKrxRd2z/ixd7qf4dHN
Pzn7700jSco/PtYweQYJKoZIhvcNAQkPMWwwajALBglghkgBZQMEASowCwYJYIZI
AWUDBAEWMAsGCWCGSAFlAwQBAjAKBggqhkiG9w0DBzAOBggqhkiG9w0DAgICAIAw
DQYIKoZIhvcNAwICAUAwBwYFKw4DAgcwDQYIKoZIhvcNAwICASgwCgYIKoZIzj0E
AwMEaDBmAjEAyZjQY1GZ/jgyNiANfUFIdfFfyqq0+6qFj5XUW/F6ksx5a5j51SBC
t5madqRJyVpTAjEAjLXZcIsz+FvzpVNqo5SRHk1VIIDygjWVxV6ytWGBe3JRInIP
XwdKGUdkGCL08J3e

------25E51055B53B71BB24C715CC4466A099--

`;

/** ECDSA on P-521, with SHA-512 */
export const kECClearSigned521 = `From: EC Alice <ec521@example.com>
To: User <user@example.com>
Subject: Signed test
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-ec521@example.com>
MIME-Version: 1.0
Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-512"; boundary="----3BE2B724EE772B743C71A2505ED03F5B"

This is an S/MIME signed message

------3BE2B724EE772B743C71A2505ED03F5B
Content-Type: text/plain; charset=utf-8

Hello, this is signed.
------3BE2B724EE772B743C71A2505ED03F5B
Content-Type: application/pkcs7-signature; name="smime.p7s"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="smime.p7s"

MIIEpgYJKoZIhvcNAQcCoIIElzCCBJMCAQExDTALBglghkgBZQMEAgMwCwYJKoZI
hvcNAQcBoIICaDCCAmQwggHGoAMCAQICFCKUt3ew41m6JYWhnY6mSHOOymlNMAoG
CCqGSM49BAMEMDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFl
YzUyMUBleGFtcGxlLmNvbTAeFw0yNjA5MDMwNjI3MDZaFw0zNjA4MzEwNjI3MDZa
MDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcNAQkBFhFlYzUyMUBleGFt
cGxlLmNvbTCBmzAQBgcqhkjOPQIBBgUrgQQAIwOBhgAEALla9Jb+8BKJjIJqGTl1
SUcVv4XAmmjwA67VTIvnl9VHYN3kFEyVpwGKegMPonTtlSwjRiyfVw4A+hGFadMp
662qAG2E1eVMZw2k20H8THCJd+MUZSua2YhwIufO7wsJ4G0ZE53bdsLWMZePfmoN
RmTMenQQNVDox/JLaj0qQvwLa747o3EwbzAdBgNVHQ4EFgQUVncAOXc7fusE0e/K
OP4XfSdSzmAwHwYDVR0jBBgwFoAUVncAOXc7fusE0e/KOP4XfSdSzmAwDwYDVR0T
AQH/BAUwAwEB/zAcBgNVHREEFTATgRFlYzUyMUBleGFtcGxlLmNvbTAKBggqhkjO
PQQDBAOBiwAwgYcCQXV4EcmKSh0jSVg9dAQ7Z6mECXBSj4A7CASXGlg17tB73md9
Ms27SgXgcCTcPdfgES2FDXH+ayi2RyugMFAlhD95AkIBxEkozmh6WpH2kdwqks8q
WO0678vMCXwiNC4hL1FXt48mXy62zcVyVPwLDrVwuOnL4ulPZ5l8BL6t6omzqCpr
XjoxggIEMIICAAIBATBNMDUxETAPBgNVBAMMCEVDIEFsaWNlMSAwHgYJKoZIhvcN
AQkBFhFlYzUyMUBleGFtcGxlLmNvbQIUIpS3d7DjWbolhaGdjqZIc47KaU0wCwYJ
YIZIAWUDBAIDoIIBBDAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3
DQEJBTEPFw0yNjA5MDMwNjI3MDdaME8GCSqGSIb3DQEJBDFCBECZJ9CANovdf0xk
DmXviA+izhxNFRY/JV/vE0JhoIMxoB38tnO5zgyRx7nrGHJLQUB0zh690vfaqoiI
PyawAO73MHkGCSqGSIb3DQEJDzFsMGowCwYJYIZIAWUDBAEqMAsGCWCGSAFlAwQB
FjALBglghkgBZQMEAQIwCgYIKoZIhvcNAwcwDgYIKoZIhvcNAwICAgCAMA0GCCqG
SIb3DQMCAgFAMAcGBSsOAwIHMA0GCCqGSIb3DQMCAgEoMAoGCCqGSM49BAMEBIGK
MIGHAkEBTvz/Jfm3uILTxp/g3BrtfggffFIHhbKVG6K82bGhQH8KunZfmayeRzUj
y+MjMf9g1ttttnHQe906JxHk2uGRTQJCARcny51C1uc8vMFJuno+++NQrdc3Ecou
hmvW9DdKzC0ATulo6GPcJmurI+EWRrzV1GTGOPU8b99Mc/4DvZxX/yCC

------3BE2B724EE772B743C71A2505ED03F5B--

`;
