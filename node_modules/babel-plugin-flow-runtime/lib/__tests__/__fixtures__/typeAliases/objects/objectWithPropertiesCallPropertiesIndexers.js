"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = {\n    (foo: string): string;\n    (bar: boolean): boolean;\n    foo: string;\n    bar: number;\n    baz: number | string;\n    [key: string]: number;\n    [index: number]: boolean;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.object(\n    t.callProperty(t.function(\n      t.param(\"foo\", t.string()),\n      t.return(t.string())\n    )),\n    t.callProperty(t.function(\n      t.param(\"bar\", t.boolean()),\n      t.return(t.boolean())\n    )),\n    t.property(\"foo\", t.string()),\n    t.property(\"bar\", t.number()),\n    t.property(\"baz\", t.union(t.number(), t.string())),\n    t.indexer(\"key\", t.string(), t.number()),\n    t.indexer(\"index\", t.number(), t.boolean())\n  ));\n";