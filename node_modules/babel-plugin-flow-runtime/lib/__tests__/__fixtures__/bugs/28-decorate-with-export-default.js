"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\nexport default function test(id: number): number {\n  return id;\n}\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nexport default function test(id) {\n  let _idType = t.number();\n  const _returnType = t.return(t.number());\n  t.param(\"id\", _idType).assert(id);\n  return _returnType.assert(id);\n}\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\nexport default function test(id) {\n  return id;\n}\nt.annotate(\n  test,\n  t.function(\n    t.param(\"id\", t.number()),\n    t.return(t.number())\n  )\n);\n";

var combined = exports.combined = "\nimport t from \"flow-runtime\";\nexport default function test(id) {\n  let _idType = t.number();\n  const _returnType = t.return(t.number());\n  t.param(\"id\", _idType).assert(id);\n  return _returnType.assert(id);\n}\nt.annotate(\n  test,\n  t.function(\n    t.param(\"id\", t.number()),\n    t.return(t.number())\n  )\n);\n";