"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\nconst fn = (a: string): string => a;\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nconst fn = a => {\n  let _aType = t.string();\n  const _returnType = t.return(t.string());\n  t.param(\"a\", _aType).assert(a);\n  return _returnType.assert(a);\n};\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\nconst fn = t.annotate(\n  function fn(a) {\n    return a;\n  },\n  t.function(t.param(\"a\", t.string()), t.return(t.string()))\n);\n";