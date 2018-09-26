"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare module \"Demo\" {\n    declare module.exports: any;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(t.module(\"Demo\", t => {\n    t.moduleExports(t.any());\n  }));\n";