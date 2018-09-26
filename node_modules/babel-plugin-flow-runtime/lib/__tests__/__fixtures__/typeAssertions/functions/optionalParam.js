"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = (input?: string): ? string => input;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = (input?) => {\n    let _inputType = t.string();\n    const _returnType = t.return(t.nullable(t.string()));\n    t.param(\"input\", _inputType, true).assert(input);\n    return _returnType.assert(input);\n  };\n\n";