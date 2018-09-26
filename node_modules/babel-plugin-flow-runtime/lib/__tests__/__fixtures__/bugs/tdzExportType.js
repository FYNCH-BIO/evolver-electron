"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  function demo (): Thing {\n    return \"ok\";\n  }\n\n  export type Thing = string;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  function demo() {\n    const _returnType = t.return(t.tdz(() => Thing, \"Thing\"));\n    return _returnType.assert(\"ok\");\n  }\n\n  export const Thing = t.type(\"Thing\", t.string());\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  function demo() {\n    return \"ok\";\n  }\n  t.annotate(\n    demo,\n    t.function(t.return(t.tdz(() => Thing, \"Thing\")))\n  );\n\n  export const Thing = t.type(\"Thing\", t.string());\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  function demo() {\n    const _returnType = t.return(t.tdz(() => Thing, \"Thing\"));\n    return _returnType.assert(\"ok\");\n  }\n  t.annotate(\n    demo,\n    t.function(t.return(t.tdz(() => Thing, \"Thing\")))\n  );\n\n  export const Thing = t.type(\"Thing\", t.string());\n";