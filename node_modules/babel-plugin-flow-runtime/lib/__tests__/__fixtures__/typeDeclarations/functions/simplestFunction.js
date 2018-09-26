"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare function demo (): string;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(\"demo\", t.function(t.return(t.string())));\n";