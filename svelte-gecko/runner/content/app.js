function start() {
  console.log("starting");
  let browser = document.getElementById("app-frame");
  let triggeringPrincipal = Services.scriptSecurityManager.createNullPrincipal({});
  browser.loadURI(Services.io.newURI("http://localhost:5454/"), { triggeringPrincipal });
  console.log("started");
}

window.onload = start;
