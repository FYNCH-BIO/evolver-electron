"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = {\n    (input: string): string;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.object(\n    t.callProperty(t.function(\n      t.param(\"input\", t.string()),\n      t.return(t.string())\n    ))\n  ));\n";