"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare class Thing<T: string> {\n    name: T;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(t.class(\"Thing\", _Thing => {\n    const T = _Thing.typeParameter(\"T\", t.string());\n    return [\n      t.object(\n        t.property(\"name\", T)\n      )\n    ];\n  }));\n";