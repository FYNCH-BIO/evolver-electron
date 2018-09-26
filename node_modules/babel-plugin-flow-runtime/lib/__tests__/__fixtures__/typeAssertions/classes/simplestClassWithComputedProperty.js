"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point {\n    x: number = 0;\n    y: number = 0;\n\n    [\"foo\"]: boolean;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Point {\n    @t.decorate(t.number())\n    x = 0;\n\n    @t.decorate(t.number())\n    y = 0;\n\n    [\"foo\"];\n  }\n";