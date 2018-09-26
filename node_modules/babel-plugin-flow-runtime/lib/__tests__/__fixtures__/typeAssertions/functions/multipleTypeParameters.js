"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = <K, V> (key: K, value: V): Map<K, V> => new Map([[key, value]]);\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = (key, value) => {\n    const K = t.typeParameter(\"K\");\n    const V = t.typeParameter(\"V\");\n    let _keyType = t.flowInto(K);\n    let _valueType = t.flowInto(V);\n    const _returnType = t.return(t.ref(\"Map\", K, V));\n    t.param(\"key\", _keyType).assert(key);\n    t.param(\"value\", _valueType).assert(value);\n    return _returnType.assert(new Map([[key, value]]));\n  };\n\n";