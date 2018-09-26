"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare class Thing {\n    name: string;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(\n    t.class(\n      \"Thing\",\n      t.object(\n        t.property(\"name\", t.string())\n      )\n    )\n  );\n";