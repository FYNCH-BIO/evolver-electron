"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    (input: string) => input,\n    (...input: boolean[]) => input,\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = (..._arg0) => {\n    if (typeof _arg0[0] === \"string\") {\n      return _arg0[0];\n    }\n    else if (t.array(t.boolean()).accepts(_arg0)) {\n      return _arg0;\n    }\n    else {\n      return _arg0[0];\n    }\n  };\n";