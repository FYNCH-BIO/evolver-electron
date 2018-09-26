"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  export type Demo = number;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  export const Demo = t.type(\"Demo\", t.number());\n";