"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = async (): Promise<string> => \"hello world\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = async () => {\n    const _returnType = t.return(t.union(t.string(), t.ref(\"Promise\", t.string())));\n    return _returnType.assert(\"hello world\");\n  };\n\n";