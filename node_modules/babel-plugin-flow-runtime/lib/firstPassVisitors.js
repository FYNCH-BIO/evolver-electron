'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = firstPassVisitors;

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _attachImport = require('./attachImport');

var _attachImport2 = _interopRequireDefault(_attachImport);

var _getTypeParameters = require('./getTypeParameters');

var _getTypeParameters2 = _interopRequireDefault(_getTypeParameters);

var _findIdentifiers = require('./findIdentifiers');

var _findIdentifiers2 = _interopRequireDefault(_findIdentifiers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function firstPassVisitors(context) {

  return {
    Program: {
      exit: function exit(path) {
        if (context.shouldImport) {
          (0, _attachImport2.default)(context, path);
        }
      }
    },
    GenericTypeAnnotation: function GenericTypeAnnotation(path) {
      var id = path.get('id');
      path.scope.setData('seenReference:' + id.node.name, true);
    },
    Identifier: function Identifier(path) {
      var parentPath = path.parentPath;


      if (parentPath.isFlow()) {
        // This identifier might point to a type that has not been resolved yet
        if (parentPath.isTypeAlias() || parentPath.isInterfaceDeclaration()) {
          if (path.key === 'id') {
            return; // this is part of the declaration name
          }
        }
        if (context.hasTDZIssue(path.node.name, path)) {
          context.markTDZIssue(path.node);
        }
        return;
      } else if (!context.shouldImport) {
        return;
      }
      if (path.key === 'property' && parentPath.isMemberExpression() && parentPath.node.computed) {
        return;
      }
      var name = path.node.name;

      if (name === context.libraryId) {
        context.libraryId = path.scope.generateUid(context.libraryId);
      }
    },
    TypeAlias: function TypeAlias(path) {
      context.defineTypeAlias(path.node.id.name, path);
    },
    InterfaceDeclaration: function InterfaceDeclaration(path) {
      context.defineTypeAlias(path.node.id.name, path);
    },
    ImportDeclaration: function ImportDeclaration(path) {
      var source = path.get('source').node.value;

      var isReact = path.node.importKind !== 'type' && (source === 'react' || source === 'preact');

      var isFlowRuntime = path.node.importKind !== 'type' && source === 'flow-runtime';

      if (isReact) {
        path.parentPath.scope.setData('importsReact', true);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = path.get('specifiers')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var specifier = _step.value;

          var local = specifier.get('local');
          var name = local.node.name;

          if (path.node.importKind === 'type') {
            context.defineImportedType(name, specifier);
          } else {
            context.defineValue(name, path);
            if (isReact) {
              if (specifier.isImportDefaultSpecifier()) {
                path.parentPath.scope.setData('reactLib', name);
              } else if (specifier.isImportNamespaceSpecifier()) {
                path.parentPath.scope.setData('reactLib', name);
              } else if (specifier.node.imported.name === 'Component') {
                path.parentPath.scope.setData('reactComponentClass', name);
              } else if (specifier.node.imported.name === 'PureComponent') {
                path.parentPath.scope.setData('reactPureComponentClass', name);
              }
            } else if (isFlowRuntime && (specifier.isImportDefaultSpecifier() || specifier.isImportNamespaceSpecifier())) {
              context.shouldImport = false;
              context.libraryId = name;
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
    },
    VariableDeclarator: function VariableDeclarator(path) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _findIdentifiers2.default)(path.get('id'))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var id = _step2.value;
          var name = id.node.name;

          context.defineValue(name, path);
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
    },
    Function: function Function(path) {
      if (path.isFunctionDeclaration() && path.has('id')) {
        var name = path.node.id.name;

        context.defineValue(name, path.parentPath);
      }
      var params = path.get('params').filter(hasTypeAnnotation);
      var typeParameters = (0, _getTypeParameters2.default)(path);
      var body = path.get('body');
      if (path.node.generator && path.node.returnType) {
        var yieldTypeUid = body.scope.generateUidIdentifier('yieldType');
        body.scope.setData('yieldTypeUid', yieldTypeUid);
        var returnTypeUid = body.scope.generateUidIdentifier('returnType');
        body.scope.setData('returnTypeUid', returnTypeUid);
        var nextTypeUid = body.scope.generateUidIdentifier('nextType');
        body.scope.setData('nextTypeUid', nextTypeUid);
      } else if (path.node.async && path.node.returnType) {
        var _returnTypeUid = body.scope.generateUidIdentifier('returnType');
        body.scope.setData('returnTypeUid', _returnTypeUid);
      }

      if (path.has('returnType') || params.length || typeParameters.length) {
        if (!body.isBlockStatement()) {
          // Expand arrow function expressions
          body.replaceWith(t.blockStatement([t.returnStatement(body.node)]));
          body = path.get('body');
          path.node.expression = false;
        }

        typeParameters.forEach(function (item) {
          var name = item.node.name;

          context.defineTypeParameter(name, item);
        });
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = (0, _findIdentifiers2.default)(params)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var id = _step3.value;

            context.defineTypeAlias(id.node.name, id);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    },
    Class: function Class(path) {
      var className = 'AnonymousClass';
      if (path.isClassDeclaration() && path.has('id')) {
        var name = path.node.id.name;
        // have we seen a reference to this class already?
        // if so we should replace it with a `var className = class className {}`
        // to avoid temporal dead zone issues

        if (!path.parentPath.isExportDefaultDeclaration() && path.scope.getData('seenReference:' + name)) {
          path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(t.identifier(name), t.classExpression(path.node.id, path.node.superClass, path.node.body, path.node.decorators || []))]));
          return;
        }
        className = name;
        context.defineValue(name, path.parentPath);
      }
      context.setClassData(path, 'currentClassName', className);
      var typeParameters = (0, _getTypeParameters2.default)(path);
      typeParameters.forEach(function (item) {
        var name = item.node.name;

        context.defineClassTypeParameter(name, item);
      });
      if (typeParameters.length > 0 || path.has('superTypeParameters')) {
        ensureConstructor(path);
        context.setClassData(path, 'typeParametersUid', path.parentPath.scope.generateUid('_typeParameters'));
      } else if (path.has('implements') && (context.shouldAssert || context.shouldWarn)) {
        ensureConstructor(path);
      }

      if (typeParameters.length > 0) {
        context.setClassData(path, 'typeParametersSymbolUid', path.parentPath.scope.generateUid(className + 'TypeParametersSymbol'));
      } else {
        context.setClassData(path, 'typeParametersSymbolUid', '');
      }
    }
  };
}

/**
 * Determine whether the given node path has a type annotation or not.
 */
function hasTypeAnnotation(path) {
  if (!path.node) {
    return false;
  } else if (path.node.typeAnnotation) {
    return true;
  } else if (path.isAssignmentPattern()) {
    return hasTypeAnnotation(path.get('left'));
  } else {
    return false;
  }
}

/**
 * Ensure that the given class contains a constructor.
 */
function ensureConstructor(path) {
  var lastProperty = void 0;

  var _path$get$filter = path.get('body.body').filter(function (item) {
    if (item.isClassProperty()) {
      lastProperty = item;
      return false;
    }
    return item.node.kind === 'constructor';
  }),
      _path$get$filter2 = _slicedToArray(_path$get$filter, 1),
      existing = _path$get$filter2[0];

  if (existing) {
    return existing;
  }
  var constructorNode = void 0;
  if (path.has('superClass')) {
    var args = t.identifier('args');
    constructorNode = t.classMethod('constructor', t.identifier('constructor'), [t.restElement(args)], t.blockStatement([t.expressionStatement(t.callExpression(t.super(), [t.spreadElement(args)]))]));
  } else {
    constructorNode = t.classMethod('constructor', t.identifier('constructor'), [], t.blockStatement([]));
  }

  if (lastProperty) {
    lastProperty.insertAfter(constructorNode);
  } else {
    path.get('body').unshiftContainer('body', constructorNode);
  }
}