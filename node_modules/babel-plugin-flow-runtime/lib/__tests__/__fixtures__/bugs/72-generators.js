"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\ntype Options = {};\n\nexport const makeApiCallSaga = (opts: Options) => {\n  return function* apiCallWatcherSaga (): Generator<*, void, *> {\n  };\n};\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nconst Options = t.type(\"Options\", t.object());\n\nexport const makeApiCallSaga = opts => {\n  let _optsType = Options;\n  t.param(\"opts\", _optsType).assert(opts);\n  return function* apiCallWatcherSaga() {\n    const _yieldType = t.existential();\n    const _nextType = t.existential();\n    const _returnType = t.return(t.void());\n  };\n};\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\nconst Options = t.type(\"Options\", t.object());\n\nexport const makeApiCallSaga = t.annotate(\n  function makeApiCallSaga(opts) {\n    return t.annotate(\n      function* apiCallWatcherSaga() {},\n      t.function(t.return(t.ref(\"Generator\", t.existential(), t.void(), t.existential())))\n    );\n  },\n  t.function(t.param(\"opts\", Options))\n);\n";

var combined = exports.combined = "\nimport t from \"flow-runtime\";\nconst Options = t.type(\"Options\", t.object());\n\nexport const makeApiCallSaga = t.annotate(\n  function makeApiCallSaga(opts) {\n    let _optsType = Options;\n    t.param(\"opts\", _optsType).assert(opts);\n    return t.annotate(\n      function* apiCallWatcherSaga() {\n        const _yieldType = t.existential();\n        const _nextType = t.existential();\n        const _returnType = t.return(t.void());\n      },\n      t.function(t.return(t.ref(\"Generator\", t.existential(), t.void(), t.existential())))\n    );\n  },\n  t.function(t.param(\"opts\", Options))\n);\n";