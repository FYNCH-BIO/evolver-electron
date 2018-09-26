"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = (...args: string[]): string[] => args;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = (...args) => {\n    let _argsType = t.array(t.string());\n    const _returnType = t.return(t.array(t.string()));\n    t.rest(\"args\", _argsType).assert(args);\n    return _returnType.assert(args);\n  };\n\n";