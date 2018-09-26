"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = typeAnnotationIterator;


var visitors = {
  ArrayTypeAnnotation: ["elementType"],
  ClassImplements: ["id", "typeParameters"],
  ClassProperty: ["key", "value", "typeAnnotation", "decorators"],
  ClassMethod: ["key", "typeParameters", "params", "returnType"],
  ObjectProperty: ["key", "value", "typeAnnotation", "decorators"],
  ObjectMethod: ["key", "typeParameters", "params", "returnType"],
  DeclareClass: ["id", "typeParameters", "extends", "body"],
  DeclareFunction: ["id"],
  DeclareInterface: ["id", "typeParameters", "extends", "body"],
  DeclareModule: ["id", "body"],
  DeclareModuleExports: ["typeAnnotation"],
  DeclareTypeAlias: ["id", "typeParameters", "right"],
  DeclareVariable: ["id"],
  FunctionTypeAnnotation: ["typeParameters", "params", "rest", "returnType"],
  FunctionTypeParam: ["name", "typeAnnotation"],
  GenericTypeAnnotation: ["id", "typeParameters"],
  InterfaceExtends: ["id", "typeParameters"],
  InterfaceDeclaration: ["id", "typeParameters", "extends", "body"],
  IntersectionTypeAnnotation: ["types"],
  NullableTypeAnnotation: ["typeAnnotation"],
  TupleTypeAnnotation: ["types"],
  TypeofTypeAnnotation: ["argument"],
  TypeAlias: ["id", "typeParameters", "right"],
  TypeAnnotation: ["typeAnnotation"],
  TypeCastExpression: ["expression", "typeAnnotation"],
  TypeParameter: ["bound"],
  TypeParameterDeclaration: ["params"],
  TypeParameterInstantiation: ["params"],
  ObjectTypeAnnotation: ["properties", "indexers", "callProperties"],
  ObjectTypeCallProperty: ["value"],
  ObjectTypeIndexer: ["id", "key", "value"],
  ObjectTypeProperty: ["key", "value"],
  QualifiedTypeIdentifier: ["id", "qualification"],
  UnionTypeAnnotation: ["types"],
  ArrowFunctionExpression: ["typeParameters", "params", "returnType"],
  FunctionExpression: ["typeParameters", "params", "returnType"],
  FunctionDeclaration: ["typeParameters", "params", "returnType"],
  Identifier: ["typeAnnotation"],
  RestElement: ["argument", "typeAnnotation"],
  ArrayPattern: ["typeAnnotation"],
  ObjectPattern: ["typeAnnotation"],
  AssignmentPattern: ["left"]
};

function* typeAnnotationIterator(path) {
  yield path;
  var visitor = visitors[path.type];
  if (visitor) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = visitor[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        var value = path.get(key);
        if (value) {
          if (Array.isArray(value)) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var element = _step2.value;

                yield* typeAnnotationIterator(element);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          } else {
            yield* typeAnnotationIterator(value);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
}