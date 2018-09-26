"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type Tree<T> = {\n    value: T;\n    left?: Tree<T>;\n    right?: Tree<T>;\n  };\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const Tree = t.type(\"Tree\", Tree => {\n    const T = Tree.typeParameter(\"T\");\n\n    return t.object(\n      t.property(\"value\", T),\n      t.property(\"left\", t.ref(Tree, T), true),\n      t.property(\"right\", t.ref(Tree, T), true)\n    );\n  });\n";