"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = (): string => \"hello world\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = () => {\n    const _returnType = t.return(t.string());\n    return _returnType.assert(\"hello world\");\n  };\n\n";