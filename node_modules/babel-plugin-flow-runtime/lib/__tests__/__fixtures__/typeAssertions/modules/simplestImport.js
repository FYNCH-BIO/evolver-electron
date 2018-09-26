"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import type {Demo} from './simplestExport';\n";

var expected = exports.expected = "\n  import { Demo as _Demo } from './simplestExport';\n  import t from \"flow-runtime\";\n  const Demo = t.tdz(() => _Demo);\n";