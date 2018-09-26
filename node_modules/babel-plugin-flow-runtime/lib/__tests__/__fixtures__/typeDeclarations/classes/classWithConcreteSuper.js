"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Thing {\n    name: string;\n  }\n\n  declare class Place extends Thing {\n    url: string;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Thing {\n    @t.decorate(t.string())\n    name;\n  }\n\n  t.declare(\n    t.class(\n      \"Place\",\n      t.object(\n        t.property(\"url\", t.string())\n      ),\n      t.extends(Thing)\n    )\n  );\n";