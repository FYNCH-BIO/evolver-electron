"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point <T: number> {\n    x: T = 0;\n    y: T = 0;\n\n    constructor (x: T, y: T) {\n      this.x = x;\n      this.y = y;\n    }\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  const _PointTypeParametersSymbol = Symbol(\"PointTypeParameters\");\n\n  class Point {\n\n    static [t.TypeParametersSymbol] = _PointTypeParametersSymbol;\n\n    @t.decorate(function () {\n      return t.flowInto(this[_PointTypeParametersSymbol].T);\n    })\n    x = 0;\n    @t.decorate(function () {\n      return t.flowInto(this[_PointTypeParametersSymbol].T);\n    })\n    y = 0;\n\n    constructor(x, y) {\n      this[_PointTypeParametersSymbol] = {\n        T: t.typeParameter(\"T\", t.number())\n      };\n      let _xType = t.flowInto(this[_PointTypeParametersSymbol].T);\n      let _yType = t.flowInto(this[_PointTypeParametersSymbol].T);\n      t.param(\"x\", _xType).assert(x);\n      t.param(\"y\", _yType).assert(y);\n      this.x = x;\n      this.y = y;\n    }\n  }\n";