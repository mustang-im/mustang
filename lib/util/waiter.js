var assert = require("util/util").assert;

/**
 * Allows to call many async functions,
 * and wait for them *all* to complete.
        var w = new Waiter(successCallback, errorCallback);
        for (var lang in allLanguages) {
          lodTitles(storage, lang, w.success(), w.error());
          lodDescrs(storage, lang, w.success(), w.error());
          var infoSuccess = w.success();
          lodInfo(storage, lang, function() {
            // Do NOT call w.success() here directly. It's too late.
            infoSuccess();
          }, w.error());
        }
 */
function Waiter(successCallback, errorCallback) {
  assert(typeof(successCallback) == "function", "Need successCallback");
  assert(typeof(errorCallback) == "function", "Need errorCallback");
  this.successCallback = successCallback;
  this.errorCallback = errorCallback;
  this.waiting = 0;
  this.hadError = false;
}
Waiter.prototype = {
  // config
  reportOnlyFirstError : true,
  successAfterError : false,

  // get callbacks
  success : function() {
    var self = this;
    self.waiting++;
    return function() {
      if (--self.waiting == 0 &&
          (self.successAfterError || !self.hadError)) {
        self.successCallback();
      }
    };
  },
  error : function() {
    var self = this;
    return function(e) {
      if ( !self.hadError || !self.reportOnlyFirstError) {
        self.errorCallback(e);
      }
      self.hadError = true;
      if (--self.waiting == 0 &&
          self.successAfterError) {
        self.successCallback();
      }
    };
  },
}

exports.Waiter = Waiter;
