function start() {
  console.log("starting");
  let browser = document.getElementById("app-frame");
  let triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();
  browser.loadURI(Services.io.newURI("resource://dist/index.html"), { triggeringPrincipal });
  console.log("started");
}

window.onload = start;
