"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point {\n    x: number = 0;\n    y: number = 0;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Point {\n    @t.decorate(t.number())\n    x = 0;\n\n    @t.decorate(t.number())\n    y = 0;\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"Point\",\n    t.property(\"x\", t.number()),\n    t.property(\"y\", t.number())\n  ))\n  class Point {\n    x = 0;\n    y = 0;\n  }\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"Point\",\n    t.property(\"x\", t.number()),\n    t.property(\"y\", t.number())\n  ))\n  class Point {\n    @t.decorate(t.number())\n    x = 0;\n\n    @t.decorate(t.number())\n    y = 0;\n  }\n";