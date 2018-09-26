"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  function *demo (): Generator<string, void, void> {\n    yield \"hello world\";\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  function* demo() {\n    const _yieldType = t.string();\n    const _nextType = t.void();\n    const _returnType = t.return(t.void());\n    yield _yieldType.assert(\"hello world\");\n  }\n\n";