"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n\ndeclare class Error {\n    static (message?:string):Error;\n    message: string;\n    static captureStackTrace?: (target: Object, constructor?: Function) => void;\n}\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\nt.declare(t.class(\n  \"Error\",\n  t.object(\n    t.staticCallProperty(t.function(\n      t.param(\"message\", t.string(), true),\n      t.return(t.ref(\"Error\"))\n    )),\n    t.property(\"message\", t.string()),\n    t.staticProperty(\"captureStackTrace\", t.function(\n      t.param(\"target\", t.object()),\n      t.param(\"constructor\", t.function(), true),\n      t.return(t.void())\n    ), true)\n  )\n));\n";