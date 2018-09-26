"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = {\n    [key: string]: number;\n    [index: number]: boolean;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.object(\n    t.indexer(\"key\", t.string(), t.number()),\n    t.indexer(\"index\", t.number(), t.boolean())\n  ));\n";