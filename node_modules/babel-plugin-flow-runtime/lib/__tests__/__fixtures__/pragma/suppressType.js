"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var input = exports.input = "\n/* @flow */\n\ntype Demo = 123;\n\nlet oneTwoThree: Demo = 123;\n\n(oneTwoThree: $FlowFixMe);\n\noneTwoThree = 456;\nconsole.log(123, '=', oneTwoThree);\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nconst Demo = t.type(\"Demo\", t.number(123));\n\nlet _oneTwoThreeType = Demo,\n    oneTwoThree = _oneTwoThreeType.assert(123);\n\n_oneTwoThreeType = t.any();\n_oneTwoThreeType.assert(oneTwoThree);\noneTwoThree = _oneTwoThreeType.assert(456);\nconsole.log(123, '=', oneTwoThree);\n\n";