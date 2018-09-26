"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\nexport default class {\n  a: string\n}\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  export default class {\n    @t.decorate(t.string())\n    a;\n  }\n";