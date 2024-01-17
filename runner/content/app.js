var {Subprocess} = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");

var XULBrowserWindow = {
  QueryInterface: ChromeUtils.generateQI(["nsISupportsWeakReference", "nsIXULBrowserWindow"]),
  setOverLink(link) {
    // Used to show the link in the status "bar" if any.
  },
  // onBeforeLinkTraversal obsoleted in Gecko 89 by bug 1701668
  showTooltip(x, y, label, direction, browser) {
    let tooltip = document.getElementById("aHTMLTooltip");
    tooltip.label = label;
    tooltip.style.direction = direction;
    tooltip.openPopupAtScreen(x / devicePixelRatio, y / devicePixelRatio);
  },
  hideTooltip() {
    document.getElementById("aHTMLTooltip").hidePopup();
  },
  // getTabCount() obsoleted in Gecko 63 by bug 1350642
};

var gProcess;

async function start() {
  console.log("starting");
  docShell.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIAppWindow).XULBrowserWindow = XULBrowserWindow;

  let node = await Subprocess.pathSearch('node');
  gProcess = await Subprocess.call({
    command: node,
    arguments: ['server'],
    workdir: Services.dirsvc.get("CurProcD", Ci.nsIFile).path,
  });
  await gProcess.stdout.read();

  let browser = document.getElementById("app-frame");
  let triggeringPrincipal = Services.scriptSecurityManager.createNullPrincipal({});
  browser.loadURI(Services.io.newURI("http://localhost:5454/"), { triggeringPrincipal });
  //let triggeringPrincipal = Services.scriptSecurityManager.getSystemPrincipal();
  //browser.loadURI(Services.io.newURI("resource://code/index.html"), { triggeringPrincipal });
  console.log("started");
}

window.onload = start;
