"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  for (const prop: any of []) {\n    (prop: any);\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let _propType = t.any();\n  for (const prop of []) {\n    _propType = t.any();\n    _propType.assert(prop);\n  }\n";