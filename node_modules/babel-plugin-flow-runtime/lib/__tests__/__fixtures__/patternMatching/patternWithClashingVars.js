"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import t from \"flow-runtime\";\n  const pattern = t.pattern(\n    (a: string, b: string) => {\n      const c = a + b;\n      return c.toUpperCase();\n    },\n    (a: boolean, c: number) => {\n      const b = c > 0;\n      return a && b ? \"YES\" : \"NO\";\n    },\n    (a: number, b: number, c: number) => {\n      return a + b + c;\n    },\n    _ => _\n  );\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const pattern = (_arg0, _arg1, _arg2) => {\n    if (typeof _arg0 === \"string\" && typeof _arg1 === \"string\") {\n      const c = _arg0 + _arg1;\n      return c.toUpperCase();\n    }\n    else if (typeof _arg0 === \"boolean\" && typeof _arg1 === \"number\") {\n      const b = _arg1 > 0;\n      return _arg0 && b ? \"YES\" : \"NO\";\n    }\n    else if (typeof _arg0 === \"number\" && typeof _arg1 === \"number\" && typeof _arg2 === \"number\") {\n      return _arg0 + _arg1 + _arg2;\n    }\n    else {\n      return _arg0;\n    }\n  };\n";