"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  function *demo (): Generator<string, void, void> {\n    yield* \"hello world\";\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  function* demo() {\n    const _yieldType = t.string();\n    const _nextType = t.void();\n    const _returnType = t.return(t.void());\n    yield* t.wrapIterator(_yieldType)(\"hello world\");\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  function* demo() {\n    yield* \"hello world\";\n  }\n  t.annotate(demo, t.function(\n    t.return(t.ref(\"Generator\", t.string(), t.void(), t.void()))\n  ));\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  function* demo() {\n    const _yieldType = t.string();\n    const _nextType = t.void();\n    const _returnType = t.return(t.void());\n    yield* t.wrapIterator(_yieldType)(\"hello world\");\n  }\n  t.annotate(demo, t.function(\n    t.return(t.ref(\"Generator\", t.string(), t.void(), t.void()))\n  ));\n";