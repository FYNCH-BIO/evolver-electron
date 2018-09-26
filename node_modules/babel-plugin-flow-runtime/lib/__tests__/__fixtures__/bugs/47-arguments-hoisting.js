"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\ntype Person = {\n  name: string\n};\n\nlet sayHello = ({ name } : Person) => {\n  sayHello(name);\n}\n\nsayHello({ name: \"Kermit\" });\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nconst Person = t.type(\"Person\", t.object(\n  t.property(\"name\", t.string())\n));\n\nlet sayHello = _arg => {\n  let { name } = Person.assert(_arg);\n  sayHello(name);\n};\n\nsayHello({ name: \"Kermit\" });\n";