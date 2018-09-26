"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = ({foo}?: {foo: string}): string => foo;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = (_arg?) => {\n    const _returnType = t.return(t.string());\n    let { foo } = t.object(\n      t.property(\"foo\", t.string())\n    ).assert(_arg);\n    return _returnType.assert(foo);\n  };\n\n";