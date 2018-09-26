"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    (input: string) => input.toUpperCase(),\n    (input: boolean, b: number) => input && b > 0 ? \"YES\" : \"NO\",\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = (_arg0, _arg1) => {\n    if (typeof _arg0 === \"string\") {\n      return _arg0.toUpperCase();\n    }\n    else if (typeof _arg0 === \"boolean\" && typeof _arg1 === \"number\") {\n      return _arg0 && _arg1 > 0 ? \"YES\" : \"NO\";\n    }\n    else {\n      return _arg0;\n    }\n  };\n";