"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class A {\n    b(): this {\n      return this;\n    }\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class A {\n    b() {\n      const _returnType = t.return(t.this(this));\n      return _returnType.assert(this);\n    }\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"A\",\n    t.method(\"b\", t.return(t.this()))\n  ))\n  class A {\n    b() {\n      return this;\n    }\n  }\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"A\",\n    t.method(\"b\", t.return(t.this()))\n  ))\n  class A {\n    b() {\n      const _returnType = t.return(t.this(this));\n      return _returnType.assert(this);\n    }\n  }\n";