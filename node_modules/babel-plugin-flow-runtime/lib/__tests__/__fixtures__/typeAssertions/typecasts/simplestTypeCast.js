"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n let a = 123;\n (a: number);\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let a = 123;\n  let _aType = t.number();\n  _aType.assert(a);\n";