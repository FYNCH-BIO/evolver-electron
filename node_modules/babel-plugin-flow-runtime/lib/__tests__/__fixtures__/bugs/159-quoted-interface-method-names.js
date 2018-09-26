"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  interface A {\n    \"a\"(): number;\n    \"b\"(): string;\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const A = t.type(\"A\", t.object(t.property(\"a\", t.function(t.return(t.number()))), t.property(\"b\", t.function(t.return(t.string())))));\n";