"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    (input: string) => input,\n    (foo: string, bar: number, ...input: boolean[]) => input,\n    (foo: string, ...extra: number[]) => foo,\n    (foo: string, bar: string, baz: string, qux: string) => foo,\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = (_arg0, ..._arg1) => {\n    const _input = _arg1.slice(1);\n    if (typeof _arg0 === \"string\") {\n      return _arg0;\n    }\n    else if (typeof _arg0 === \"string\" && typeof _arg1[0] === \"number\" && t.array(t.boolean()).accepts(_input)) {\n      return _input;\n    }\n    else if (typeof _arg0 === \"string\" && t.array(t.number()).accepts(_arg1)) {\n      return _arg0;\n    }\n    else if (typeof _arg0 === \"string\" && typeof _arg1[0] === \"string\" && typeof _arg1[1] === \"string\" && typeof _arg1[2] === \"string\") {\n      return _arg0;\n    }\n    else {\n      return _arg0;\n    }\n  };\n";