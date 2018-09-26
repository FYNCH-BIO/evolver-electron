"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  const demo = <T: string> (input: T): T => input;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const demo = input => {\n  const T = t.typeParameter(\"T\", t.string());\n    let _inputType = t.flowInto(T);\n    const _returnType = t.return(T);\n    t.param(\"input\", _inputType).assert(input);\n    return _returnType.assert(input);\n  };\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(input) {\n      return input;\n    },\n    t.function(_fn => {\n      const T = _fn.typeParameter(\"T\", t.string());\n      return [\n        t.param(\"input\", t.flowInto(T)),\n        t.return(T)\n      ];\n    })\n  );\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  const demo = t.annotate(\n    function demo(input) {\n      const T = t.typeParameter(\"T\", t.string());\n      let _inputType = t.flowInto(T);\n      const _returnType = t.return(T);\n      t.param(\"input\", _inputType).assert(input);\n      return _returnType.assert(input);\n    },\n    t.function(_fn => {\n      const T = _fn.typeParameter(\"T\", t.string());\n      return [\n        t.param(\"input\", t.flowInto(T)),\n        t.return(T)\n      ];\n    })\n  );\n";