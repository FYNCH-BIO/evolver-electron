"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point {\n    x: number;\n    y: number;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Point {\n    @t.decorate(t.number())\n    x;\n\n    @t.decorate(t.number())\n    y;\n  }\n";