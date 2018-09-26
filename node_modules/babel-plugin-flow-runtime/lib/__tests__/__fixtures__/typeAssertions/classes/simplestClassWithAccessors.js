"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point {\n    x: number = 0;\n    y: number = 0;\n\n    get foo (): boolean {\n      return true;\n    }\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Point {\n    @t.decorate(t.number())\n    x = 0;\n\n    @t.decorate(t.number())\n    y = 0;\n\n    get foo() {\n      const _returnType = t.return(t.boolean());\n      return _returnType.assert(true);\n    }\n  }\n";