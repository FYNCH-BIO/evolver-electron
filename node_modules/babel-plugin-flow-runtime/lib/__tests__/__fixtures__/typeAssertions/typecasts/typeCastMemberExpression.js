"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const a = {\n    b: 123\n  };\n  (a.b: number);\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const a = {\n    b: 123\n  };\n  t.number().assert(a.b);\n";