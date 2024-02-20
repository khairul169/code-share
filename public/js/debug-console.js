if (window.parent !== window) {
  const _log = console.log;
  const _error = console.error;
  const _warn = console.warn;

  console.log = function (...args) {
    parent.window.postMessage({ type: "log", args: args }, "*");
    _log(...args);
  };
  console.error = function (...args) {
    parent.window.postMessage({ type: "error", args: args }, "*");
    _error(...args);
  };
  console.warn = function (...args) {
    parent.window.postMessage({ type: "warn", args: args }, "*");
    _warn(...args);
  };
}
