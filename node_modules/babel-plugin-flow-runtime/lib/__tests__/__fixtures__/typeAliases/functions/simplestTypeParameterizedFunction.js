"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = <T> () => T;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.function(_fn => {\n    const T = _fn.typeParameter(\"T\");\n    return [t.return(T)];\n  }));\n";