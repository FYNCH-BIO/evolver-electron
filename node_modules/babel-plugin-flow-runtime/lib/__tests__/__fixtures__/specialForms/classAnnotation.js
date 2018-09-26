"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class User {}\n\n  function demo (model: Class<User>) {\n\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  class User {}\n\n  function demo(model) {\n    let _modelType = t.Class(t.ref(User));\n    t.param(\"model\", _modelType).assert(model);\n  }\n";

var annotated = exports.annotated = "\n  import t from \"flow-runtime\";\n  @t.annotate(t.class(\"User\"))\n  class User {}\n\n  function demo(model) {}\n\n  t.annotate(\n    demo,\n    t.function(\n      t.param(\"model\", t.Class(t.ref(User)))\n    )\n  );\n";

var combined = exports.combined = "\n  import t from \"flow-runtime\";\n  @t.annotate(t.class(\"User\"))\n  class User {}\n\n  function demo(model) {\n    let _modelType = t.Class(t.ref(User));\n    t.param(\"model\", _modelType).assert(model);\n  }\n\n  t.annotate(\n    demo,\n    t.function(\n      t.param(\"model\", t.Class(t.ref(User)))\n    )\n  );\n";