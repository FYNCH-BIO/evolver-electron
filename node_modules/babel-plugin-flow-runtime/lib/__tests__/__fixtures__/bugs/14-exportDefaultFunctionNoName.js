"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\nexport default function (a: number, b:number): number {\n  return a + b;\n}\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  export default function (a, b) {\n    let _aType = t.number();\n    let _bType = t.number();\n    const _returnType = t.return(t.number());\n    t.param(\"a\", _aType).assert(a);\n    t.param(\"b\", _bType).assert(b);\n    return _returnType.assert(a + b);\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  export default t.annotate(\n    function (a, b) {\n      return a + b;\n    },\n    t.function(\n      t.param(\"a\", t.number()),\n      t.param(\"b\", t.number()),\n      t.return(t.number())\n    )\n  );\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  export default t.annotate(\n    function (a, b) {\n      let _aType = t.number();\n      let _bType = t.number();\n      const _returnType = t.return(t.number());\n      t.param(\"a\", _aType).assert(a);\n      t.param(\"b\", _bType).assert(b);\n      return _returnType.assert(a + b);\n    },\n    t.function(\n      t.param(\"a\", t.number()),\n      t.param(\"b\", t.number()),\n      t.return(t.number())\n    )\n  );\n";