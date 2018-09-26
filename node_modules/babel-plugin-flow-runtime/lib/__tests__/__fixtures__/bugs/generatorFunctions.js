"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n\nexport default function demo <G> () {\n  function* gen (): G {\n    yield value;\n  }\n}\n\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nexport default function demo() {\n  const G = t.typeParameter(\"G\");\n  function* gen() {\n    const _yieldType = t.mixed();\n    const _returnType = t.return(t.mixed());\n    yield _yieldType.assert(value);\n  }\n}\n\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nexport default function demo() {\n  function* gen() {\n    yield value;\n  }\n  t.annotate(gen, t.function(t.return(G)));\n}\nt.annotate(demo, t.function(_fn => {\n  const G = _fn.typeParameter(\"G\");\n  return [];\n}));\n";