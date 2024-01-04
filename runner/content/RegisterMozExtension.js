var gPolicy = new WebExtensionPolicy({
  id: "mustang@beonex.com",
  mozExtensionHostname: "mustang",
  name: "Mustang",
  type: "extension",
  baseURL: Services.io.newFileURI(Services.dirsvc.get("CurProcD", Ci.nsIFile).parent).spec + "app/dist/",
  temporarilyInstalled: true,
  permissions: ["https://*/*"],
  webAccessibleResources: [{resources: ["/index.html"]}],
  allowedOrigins: new MatchPatternSet([new MatchPattern("https://*/*"), new MatchPattern("moz-extension://mustang/*")]),
  localizeCallback(string) { return string; },
  extensionPageCSP: "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';",
});
gPolicy.active = true;
