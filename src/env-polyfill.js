// Aggressive fix for CodeSandbox process.env issue
(function () {
  if (typeof global === "undefined") {
    window.global = window;
  }

  if (typeof process === "undefined") {
    window.process = {};
  }

  if (!window.process) {
    window.process = {};
  }

  if (!window.process.env) {
    window.process.env = {};
  }

  window.process.env.NODE_ENV = "development";

  // Also set it globally
  if (typeof global !== "undefined") {
    global.process = window.process;
  }
})();
