"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const a = {\n    b: 123\n  };\n  function go() {\n    return 456;\n  }\n  a.b = a.b + (go(): number);\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const a = {\n    b: 123\n  };\n  function go() {\n    return 456;\n  }\n  a.b = a.b + t.number().assert(go());\n";