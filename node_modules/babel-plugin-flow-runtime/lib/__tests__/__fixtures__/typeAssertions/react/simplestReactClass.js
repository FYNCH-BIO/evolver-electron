"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  import React from \"react\";\n\n  type Props = {\n    x: number;\n    y: number;\n  };\n\n  class Point extends React.Component {\n    props: Props;\n    render() {\n      return <div>{this.props.x} : {this.props.y}</div>;\n    }\n  }\n";

var expected = exports.expected = "\n  import React from \"react\";\n  import t from \"flow-runtime\";\n\n  const Props = t.type(\"Props\", t.object(\n    t.property(\"x\", t.number()),\n    t.property(\"y\", t.number())\n  ));\n\n  class Point extends React.Component {\n    static propTypes = t.propTypes(Props);\n    @t.decorate(Props) props;\n    render() {\n      return <div>{this.props.x} : {this.props.y}</div>;\n    }\n  }\n";