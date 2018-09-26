"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n/* @flow-runtime warn, annotate */\n\ntype Demo = 123;\n\n(\"nope\": Demo);\n\nconst demo = ([foo]: string[]): string => foo;\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n/* @flow-runtime warn, annotate */\n\nconst Demo = t.type(\"Demo\", t.number(123));\n\nt.warn(Demo, \"nope\");\n\nconst demo = t.annotate(\n  function demo(_arg) {\n    const _returnType = t.return(t.string());\n    let [foo] = t.warn(t.array(t.string()), _arg);\n    return t.warn(_returnType, foo);\n  },\n  t.function(\n    t.param(\"_arg\", t.array(t.string())),\n    t.return(t.string())\n  )\n);\n";