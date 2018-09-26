"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  class Point {\n    x: number = 0;\n    y: number = 0;\n\n    move (xDiff: number, yDiff: number): Point {\n      const point = new Point();\n      point.x = this.x + xDiff;\n      point.y = this.y + yDiff;\n      return point;\n    }\n  }\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  class Point {\n    @t.decorate(t.number())\n    x = 0;\n\n    @t.decorate(t.number())\n    y = 0;\n\n    move(xDiff, yDiff) {\n      let _xDiffType = t.number();\n      let _yDiffType = t.number();\n      const _returnType = t.return(t.ref(Point));\n      t.param(\"xDiff\", _xDiffType).assert(xDiff);\n      t.param(\"yDiff\", _yDiffType).assert(yDiff);\n      const point = new Point();\n      point.x = this.x + xDiff;\n      point.y = this.y + yDiff;\n      return _returnType.assert(point);\n    }\n  }\n";