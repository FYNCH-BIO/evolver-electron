"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    (input: string) => input.toUpperCase(),\n    (input: boolean | number) => input ? \"YES\" : \"NO\",\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = _arg0 => {\n    if (typeof _arg0 === \"string\") {\n      return _arg0.toUpperCase();\n    }\n    else if (typeof _arg0 === \"boolean\" || typeof _arg0 === \"number\") {\n      return _arg0 ? \"YES\" : \"NO\";\n    }\n    else {\n      return _arg0;\n    }\n  };\n";