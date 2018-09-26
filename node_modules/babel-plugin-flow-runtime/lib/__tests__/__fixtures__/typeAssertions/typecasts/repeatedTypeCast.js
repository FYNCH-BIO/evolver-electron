"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n let a = 123;\n (a: number);\n (a: any);\n a = \"hello world\";\n (a: string);\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let a = 123;\n  let _aType = t.number();\n  _aType.assert(a);\n  _aType = t.any();\n  _aType.assert(a);\n  a = _aType.assert(\"hello world\");\n  _aType = t.string();\n  _aType.assert(a);\n";