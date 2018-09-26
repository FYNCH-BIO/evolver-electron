"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  function *demo (): Generator<string, boolean, void> {\n    yield* \"hello world\";\n    return true;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  function* demo() {\n    const _yieldType = t.string();\n    const _nextType = t.void();\n    const _returnType = t.return(t.boolean());\n    yield* t.wrapIterator(_yieldType)(\"hello world\");\n    return _returnType.assert(true);\n  }\n\n";