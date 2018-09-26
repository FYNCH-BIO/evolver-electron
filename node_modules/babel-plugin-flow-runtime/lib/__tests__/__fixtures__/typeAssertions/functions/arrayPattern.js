"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = ([foo]: string[]): string => foo;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = _arg => {\n    const _returnType = t.return(t.string());\n    let [foo] = t.array(t.string()).assert(_arg);\n    return _returnType.assert(foo);\n  };\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(_arg) {\n      let [foo] = _arg;\n      return foo;\n    },\n    t.function(\n      t.param(\"_arg\", t.array(t.string())),\n      t.return(t.string())\n    )\n  );\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(_arg) {\n      const _returnType = t.return(t.string());\n      let [foo] = t.array(t.string()).assert(_arg);\n      return _returnType.assert(foo);\n    },\n    t.function(\n      t.param(\"_arg\", t.array(t.string())),\n      t.return(t.string())\n    )\n  );\n";