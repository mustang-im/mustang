/**
 * Delegator object
 * This is for security purposes only because `win.session.setPreloads()`
 * sets the preload script which is dangerous and `win.session.loadExtensions()`
 * loads extensions which could load also malicious extensions. There maybe other
 * methods that may also be dangerous so it's best to just expose the necessary ones.
 * 
 * Preferably, only the methods that appear in <webview> should be exposed
 * because Electron likely exposes only those because they are safe for the renderer
 * process.
 * 
 * - https://www.electronjs.org/docs/latest/api/webview-tag
 * - https://www.electronjs.org/docs/latest/api/session#sessetpreloadspreloads
 * - https://www.electronjs.org/docs/latest/api/session#sesloadextensionpath-options
 */
export class WebContents {
  private _win: Electron.WebContents;

  constructor(win: Electron.WebContents) {
    this._win = win;
  }

  copy() {
    this._win.copy();
  }

  cut() {
    this._win.cut();
  }

  paste() {
    this._win.paste();
  }

  selectAll() {
    this._win.selectAll();
  }

  copyImageAt(x: number, y: number ) {
    this._win.copyImageAt(x, y);
  }

  showDefinitionForSelection() {
    this._win.showDefinitionForSelection();
  }

  inspectElement(x: number, y: number) {
    this._win.inspectElement(x, y);
  }
  
  isDevToolsOpened() {
    return this._win.isDevToolsOpened();
  }
}