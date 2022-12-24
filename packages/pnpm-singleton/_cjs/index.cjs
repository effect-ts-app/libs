"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _plugin = require("./plugin.cjs");
Object.keys(_plugin).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _plugin[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _plugin[key];
    }
  });
});
//# sourceMappingURL=index.cjs.map