"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n const a = 123 ;\n const b: typeof a = 456;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const a = 123;\n  const b = t.typeOf(a).assert(456);\n";