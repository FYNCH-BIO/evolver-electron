"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    ([input]: string[]) => input.toUpperCase(),\n    (...items: string[]) => items.length,\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = (..._arg0) => {\n    if (t.array(t.string()).accepts(_arg0[0])) {\n      let [input] = _arg0[0];\n      return input.toUpperCase();\n    }\n    else if (t.array(t.string()).accepts(_arg0)) {\n      return _arg0.length;\n    }\n    else {\n      return _arg0[0];\n    }\n  };\n";