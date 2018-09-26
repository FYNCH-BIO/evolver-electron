"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Demo = () => void;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const Demo = t.type(\"Demo\", t.function(t.return(t.void())));\n";