"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Parent {\n    x: number = 0;\n  }\n\n  class Child extends Parent {\n    y: number = 0;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Parent {\n    @t.decorate(t.number())\n    x = 0;\n  }\n\n  class Child extends Parent {\n    @t.decorate(t.number())\n    y = 0;\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"Parent\",\n    t.property(\"x\", t.number())\n  ))\n  class Parent {\n    x = 0;\n  }\n\n  @t.annotate(t.class(\n    \"Child\",\n    t.extends(Parent),\n    t.property(\"y\", t.number())\n  ))\n  class Child extends Parent {\n    y = 0;\n  }\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n\n  @t.annotate(t.class(\n    \"Parent\",\n    t.property(\"x\", t.number())\n  ))\n  class Parent {\n    @t.decorate(t.number())\n    x = 0;\n  }\n\n  @t.annotate(t.class(\n    \"Child\",\n    t.extends(Parent),\n    t.property(\"y\", t.number())\n  ))\n  class Child extends Parent {\n    @t.decorate(t.number())\n    y = 0;\n  }\n";