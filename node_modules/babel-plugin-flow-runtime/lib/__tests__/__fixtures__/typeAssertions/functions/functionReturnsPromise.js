"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = (): Promise<string> => Promise.resolve(\"hello world\");\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = () => {\n    const _returnType = t.return(t.string());\n    return Promise.resolve(\"hello world\").then(_arg => _returnType.assert(_arg));\n  };\n\n";