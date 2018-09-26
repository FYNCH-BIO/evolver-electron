"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = (a: string, b: string): string => a + b;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = (a, b) => {\n    let _aType = t.string();\n    let _bType = t.string();\n    const _returnType = t.return(t.string());\n    t.param(\"a\", _aType).assert(a);\n    t.param(\"b\", _bType).assert(b);\n    return _returnType.assert(a + b);\n  };\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(a, b) {\n      return a + b;\n    },\n    t.function(\n      t.param(\"a\", t.string()),\n      t.param(\"b\", t.string()),\n      t.return(t.string())\n    )\n  );\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(a, b) {\n      let _aType = t.string();\n      let _bType = t.string();\n      const _returnType = t.return(t.string());\n      t.param(\"a\", _aType).assert(a);\n      t.param(\"b\", _bType).assert(b);\n      return _returnType.assert(a + b);\n    },\n    t.function(\n      t.param(\"a\", t.string()),\n      t.param(\"b\", t.string()),\n      t.return(t.string())\n    )\n  );\n";