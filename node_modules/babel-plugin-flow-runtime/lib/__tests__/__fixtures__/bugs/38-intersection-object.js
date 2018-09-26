"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\ntype Demo = {key: string} & {value: number};\n({key: \"foo\", value: 123}: Demo);\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nconst Demo = t.type(\"Demo\", t.intersection(\n  t.object(\n    t.property(\"key\", t.string())\n  ),\n  t.object(\n    t.property(\"value\", t.number())\n  )\n));\n\nDemo.assert({\n  key: \"foo\",\n  value: 123\n});\n";