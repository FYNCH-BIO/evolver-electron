"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = {\n    foo: string;\n    bar: number;\n    baz: number | string;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.object(\n    t.property(\"foo\", t.string()),\n    t.property(\"bar\", t.number()),\n    t.property(\"baz\", t.union(t.number(), t.string()))\n  ));\n";