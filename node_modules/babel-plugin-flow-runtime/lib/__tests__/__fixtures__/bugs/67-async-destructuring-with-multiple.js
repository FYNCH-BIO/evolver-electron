"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\ntype Person = {\n  name: string\n};\n\nlet sayHello = async (a, { name } : Person, {name: nom}: Person = {name: 'bob'}, extra = nom) => {\n  sayHello(name);\n}\n\nsayHello({ name: \"Kermit\" });\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nconst Person = t.type(\"Person\", t.object(\n  t.property(\"name\", t.string())\n));\n\nlet sayHello = async (a, _arg, _arg2, extra) => {\n  let { name } = Person.assert(_arg);\n  if (_arg2 === undefined) {\n    _arg2 = { name: 'bob' };\n  }\n  let { name: nom } = Person.assert(_arg2);\n  if (extra === undefined) {\n    extra = nom;\n  }\n  sayHello(name);\n};\n\nsayHello({ name: \"Kermit\" });\n";