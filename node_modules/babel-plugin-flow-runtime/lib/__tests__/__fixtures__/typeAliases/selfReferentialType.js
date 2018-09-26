"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = {\n    next: ? Demo;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", Demo => {\n    return t.object(\n      t.property(\"next\", t.nullable(Demo))\n    );\n  });\n";