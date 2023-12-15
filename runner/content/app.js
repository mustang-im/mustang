function start() {
  console.log("starting");
  let browser = document.getElementById("app-frame");
  //let triggeringPrincipal = Services.scriptSecurityManager.createNullPrincipal({});
  //browser.loadURI(Services.io.newURI("http://localhost:5454/"), { triggeringPrincipal });
  let triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();
  browser.loadURI(Services.io.newURI("resource://code/index.html"), { triggeringPrincipal });
  console.log("started");
}

window.onload = start;
