var Services = Cu.createServicesCache();

function start() {
  console.log("starting");
  let browser = document.getElementById("app-frame");
  let triggeringPrincipal = Services.scriptSecurityManager.createNullPrincipal({});
  browser.loadURI("http://localhost:5454/", { triggeringPrincipal });
  console.log("started");
}

window.onload = start;
