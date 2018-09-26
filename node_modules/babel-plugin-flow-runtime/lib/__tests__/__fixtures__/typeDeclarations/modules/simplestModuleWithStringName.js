"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare module \"foo-bar\" {\n    declare var foo: string;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(t.module(\"foo-bar\", t => {\n    t.declare(t.var(\"foo\", t.string()));\n  }));\n";