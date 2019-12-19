/**
 * App-wide access to some central functions and data.
 *
 * Keep this absolutely minimal. Do not put all globals in here,
 * just those that are needed all over the app.
 */
const gApp = {
  /**
   * App UI and content currently shows in this language.
   *
   * I.e.:
   * 1. this.storage is in this language.
   * 2. tr() returns strings in this language.
   *
   * {string} ISO 2-letter language code
   */
  currentLang: "en",

  /**
   * Show an error to user.
   *
   * {function(ex)}
   * @param ex {Error or Exception}
   */
  errorCallback: null,
};

export default gApp;
