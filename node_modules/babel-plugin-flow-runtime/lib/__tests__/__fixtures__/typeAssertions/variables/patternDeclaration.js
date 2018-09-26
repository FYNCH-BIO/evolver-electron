"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const [hello, world]: [string, string] = [\"hello\", \"world\"];\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const [hello, world] = t.tuple(t.string(), t.string()).assert([\"hello\", \"world\"]);\n";