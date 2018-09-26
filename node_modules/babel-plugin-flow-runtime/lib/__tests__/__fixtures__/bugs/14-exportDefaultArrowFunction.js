"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\nexport default (): string => \"hello world\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  export default (() => {\n    const _returnType = t.return(t.string());\n    return _returnType.assert(\"hello world\");\n  });\n";