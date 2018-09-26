"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  console.log(t.match(\n    \"foo\",\n    [\n      (input: string) => input.toUpperCase(),\n      (input: boolean) => input ? \"YES\" : \"NO\",\n      _ => _\n    ]\n  ));\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  console.log((_arg0 => {\n    if (typeof _arg0 === \"string\") {\n      return _arg0.toUpperCase();\n    }\n    else if (typeof _arg0 === \"boolean\") {\n      return _arg0 ? \"YES\" : \"NO\";\n    }\n    else {\n      return _arg0;\n    }\n  })(\"foo\"));\n";