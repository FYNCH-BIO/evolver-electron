"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Person<A: string> = {\n    name: string;\n    surname: A;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Person = t.type(\"Person\", Person => {\n    const A = Person.typeParameter(\"A\", t.string());\n    return t.object(\n      t.property(\"name\", t.string()),\n      t.property(\"surname\", A)\n    );\n  });\n";