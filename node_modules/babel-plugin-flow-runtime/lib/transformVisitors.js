'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = transformVisitors;

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _typeAnnotationIterator = require('./typeAnnotationIterator');

var _typeAnnotationIterator2 = _interopRequireDefault(_typeAnnotationIterator);

var _convert = require('./convert');

var _convert2 = _interopRequireDefault(_convert);

var _getTypeParameters = require('./getTypeParameters');

var _getTypeParameters2 = _interopRequireDefault(_getTypeParameters);

var _assert = require('assert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function transformVisitors(context) {
  var shouldCheck = context.shouldAssert || context.shouldWarn;
  return {
    'Expression|Statement': function ExpressionStatement(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
    },
    'DeclareVariable|DeclareTypeAlias|DeclareFunction|DeclareClass|DeclareModule|InterfaceDeclaration': function DeclareVariableDeclareTypeAliasDeclareFunctionDeclareClassDeclareModuleInterfaceDeclaration(path) {
      if (context.shouldSuppressPath(path)) {
        return;
      }
      var replacement = (0, _convert2.default)(context, path);
      context.replacePath(path, replacement);
    },

    ImportDeclaration: {
      enter: function enter(path) {
        if (context.shouldSuppressPath(path)) {
          path.skip();
          return;
        }

        var isImportType = path.node.importKind === 'type';
        var declarations = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = path.get('specifiers')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var specifier = _step.value;

            if (!isImportType && specifier.node.importKind !== 'type') {
              continue;
            }
            var local = specifier.get('local');
            var name = local.node.name;

            var replacement = path.scope.generateUidIdentifier(name);
            local.node.name = replacement.name;
            declarations.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), context.call('tdz', t.arrowFunctionExpression([], replacement)))]));
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

        if (declarations.length !== 0) {
          var target = path;

          var container = path.parentPath.get(path.listKey);
          for (var i = path.key; i < container.length; i++) {
            var item = container[i];
            if (item.isImportDeclaration()) {
              target = item;
              continue;
            }
            break;
          }
          for (var _i = declarations.length - 1; _i >= 0; _i--) {
            target.insertAfter(declarations[_i]);
          }
        }
      },
      exit: function exit(path) {
        if (path.node.importKind !== 'type') {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = path.get('specifiers')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var specifier = _step2.value;

              if (specifier.node.importKind === 'type') {
                specifier.node.importKind = null;
              }
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

          return;
        }
        path.node.importKind = 'value';
      }
    },
    ExportDeclaration: {
      enter: function enter(path) {
        if (context.shouldSuppressPath(path)) {
          path.skip();
          return;
        }
      },
      exit: function exit(path) {
        if (path.node.exportKind !== 'type') {
          return;
        }
        path.node.exportKind = 'value';
      }
    },
    TypeAlias: function TypeAlias(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var replacement = (0, _convert2.default)(context, path);
      context.replacePath(path, replacement);
    },
    TypeCastExpression: function TypeCastExpression(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var expression = path.get('expression');
      var typeAnnotation = path.get('typeAnnotation');
      if (shouldCheck && !expression.isIdentifier()) {
        context.replacePath(path, context.assert((0, _convert2.default)(context, typeAnnotation), expression.node));
        return;
      }
      var name = expression.node.name;
      var binding = path.scope.getBinding(name);
      if (binding) {
        if (binding.path.isCatchClause()) {
          // special case typecasts for error handlers.
          context.replacePath(path.parentPath, t.ifStatement(t.unaryExpression('!', t.callExpression(t.memberExpression((0, _convert2.default)(context, typeAnnotation), t.identifier('accepts')), [expression.node])), t.blockStatement([t.throwStatement(expression.node)])));
          return;
        } else if (name === 'reify') {
          if (typeAnnotation.isTypeAnnotation()) {
            var annotation = typeAnnotation.get('typeAnnotation');
            var isTypeWrapper = annotation.isGenericTypeAnnotation() && annotation.node.id.name === 'Type' && annotation.node.typeParameters && annotation.node.typeParameters.params && annotation.node.typeParameters.params.length === 1;
            if (isTypeWrapper) {
              context.replacePath(path, (0, _convert2.default)(context, annotation.get('typeParameters.params')[0]));
              return;
            }
          }
          context.replacePath(path, (0, _convert2.default)(context, typeAnnotation));
          return;
        }
      }

      if (!path.parentPath.isExpressionStatement()) {
        if (!shouldCheck) {
          return;
        }
        // this typecast is part of a larger expression, just replace the value inline.
        context.replacePath(path, context.assert((0, _convert2.default)(context, typeAnnotation), expression.node));
        return;
      }

      var valueUid = path.scope.getData('valueUid:' + name);
      if (!valueUid) {
        valueUid = path.scope.generateUidIdentifier(name + 'Type');
        path.scope.setData('valueUid:' + name, valueUid);
        path.getStatementParent().insertBefore(t.variableDeclaration('let', [t.variableDeclarator(valueUid, (0, _convert2.default)(context, typeAnnotation))]));
      } else {
        path.getStatementParent().insertBefore(t.expressionStatement(t.assignmentExpression('=', valueUid, (0, _convert2.default)(context, typeAnnotation))));
      }
      if (shouldCheck) {
        context.replacePath(path, context.assert(valueUid, expression.node));
      } else {
        context.replacePath(path, expression.node);
      }
    },
    VariableDeclarator: function VariableDeclarator(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var id = path.get('id');
      if (!id.has('typeAnnotation')) {
        return;
      }
      if (!id.isIdentifier()) {
        (0, _assert.ok)(id.isArrayPattern() || id.isObjectPattern());
        var init = path.get('init');
        var wrapped = init.node;
        if (shouldCheck) {
          wrapped = context.assert((0, _convert2.default)(context, id.get('typeAnnotation')), wrapped);
        }
        if (wrapped !== init.node) {
          context.replacePath(init, wrapped);
        }
        return;
      }
      var name = id.node.name;


      if (!path.has('init') || path.parentPath.node.kind !== 'const') {
        var valueUid = path.scope.generateUidIdentifier(name + 'Type');
        path.scope.setData('valueUid:' + name, valueUid);

        var isInForInOrOf = path.parentPath.key === 'left' && path.parentPath.parentPath && (path.parentPath.parentPath.isForOfStatement() || path.parentPath.parentPath.isForAwaitStatement() || path.parentPath.parentPath.isForInStatement());

        if (isInForInOrOf) {
          // we can't insert a check directly, hoist it upwards.
          path.parentPath.parentPath.insertBefore(t.variableDeclaration('let', [t.variableDeclarator(valueUid, (0, _convert2.default)(context, id.get('typeAnnotation')))]));
        } else {
          path.insertBefore(t.variableDeclarator(valueUid, (0, _convert2.default)(context, id.get('typeAnnotation'))));
        }

        if (shouldCheck && path.has('init')) {
          var _wrapped = context.assert(valueUid, path.get('init').node);

          context.replacePath(path, t.variableDeclarator(t.identifier(name), _wrapped));
        } else {
          context.replacePath(id, t.identifier(name));
        }
      } else if (shouldCheck) {
        var _wrapped2 = context.assert((0, _convert2.default)(context, id.get('typeAnnotation')), path.get('init').node);
        context.replacePath(path, t.variableDeclarator(t.identifier(name), _wrapped2));
      } else {
        context.replacePath(id, t.identifier(name));
      }
    },
    AssignmentExpression: function AssignmentExpression(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var left = path.get('left');
      if (!shouldCheck || !left.isIdentifier()) {
        return;
      }
      var name = left.node.name;
      var valueUid = path.scope.getData('valueUid:' + name);
      if (!valueUid) {
        return;
      }
      var right = path.get('right');
      context.replacePath(right, context.assert(valueUid, right.node));
    },
    Function: function Function(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      } else if (context.visited.has(path.node)) {
        path.skip();
        return;
      } else if (!shouldCheck) {
        return;
      }
      context.visited.add(path.node);
      var body = path.get('body');
      var definitions = [];
      var invocations = [];
      var typeParameters = (0, _getTypeParameters2.default)(path);
      var params = path.get('params');

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = typeParameters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var typeParameter = _step3.value;
          var name = typeParameter.node.name;

          var args = [t.stringLiteral(name)];
          if (typeParameter.has('bound') && typeParameter.has('default')) {
            args.push((0, _convert2.default)(context, typeParameter.get('bound')), (0, _convert2.default)(context, typeParameter.get('default')));
          } else if (typeParameter.has('bound')) {
            args.push((0, _convert2.default)(context, typeParameter.get('bound')));
          } else if (typeParameter.has('default')) {
            args.push(t.identifier('undefined'), // make sure we don't confuse bound with default
            (0, _convert2.default)(context, typeParameter.get('default')));
          }

          definitions.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), context.call.apply(context, ['typeParameter'].concat(args)))]));
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = params[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var param = _step4.value;

          var argumentIndex = +param.key;
          var assignmentRight = void 0;
          if (param.isAssignmentPattern()) {
            assignmentRight = param.get('right');
            param = param.get('left');
          }

          if (!param.has('typeAnnotation')) {
            continue;
          }
          var typeAnnotation = param.get('typeAnnotation');

          if (param.isObjectPattern() || param.isArrayPattern()) {
            var _args = [t.stringLiteral('arguments[' + argumentIndex + ']'), (0, _convert2.default)(context, typeAnnotation)];
            if (param.has('optional')) {
              _args.push(t.booleanLiteral(true));
            }

            var ref = t.memberExpression(t.identifier('arguments'), t.numericLiteral(argumentIndex), true);

            var expression = t.expressionStatement(context.assert(context.call.apply(context, ['param'].concat(_args)), ref));
            if (assignmentRight) {
              invocations.push(t.ifStatement(t.binaryExpression('!==', ref, t.identifier('undefined')), t.blockStatement([expression])));
            } else {
              invocations.push(expression);
            }
          } else {
            var _name = param.node.name;
            var methodName = 'param';
            if (param.isRestElement()) {
              methodName = 'rest';
              _name = param.node.argument.name;
            } else {
              (0, _assert.ok)(param.isIdentifier(), 'Param must be an identifier');
            }
            var valueUid = body.scope.generateUidIdentifier(_name + 'Type');
            body.scope.setData('valueUid:' + _name, valueUid);
            definitions.push(t.variableDeclaration('let', [t.variableDeclarator(valueUid, (0, _convert2.default)(context, typeAnnotation))]));
            var _args2 = [t.stringLiteral(_name), valueUid];
            if (param.has('optional')) {
              _args2.push(t.booleanLiteral(true));
            }
            invocations.push(t.expressionStatement(context.assert(context.call.apply(context, [methodName].concat(_args2)), t.identifier(_name))));
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      if (path.has('returnType')) {
        var returnType = path.get('returnType');
        if (returnType.type === 'TypeAnnotation') {
          returnType = returnType.get('typeAnnotation');
        }

        var extra = getFunctionInnerChecks(context, path, returnType);

        if (extra) {
          var _extra = _slicedToArray(extra, 3),
              yieldCheck = _extra[0],
              returnCheck = _extra[1],
              nextCheck = _extra[2];

          if (path.node.generator) {
            definitions.push(t.variableDeclaration('const', [t.variableDeclarator(body.scope.getData('yieldTypeUid'), yieldCheck || context.call('mixed'))]));

            if (nextCheck) {
              definitions.push(t.variableDeclaration('const', [t.variableDeclarator(body.scope.getData('nextTypeUid'), nextCheck)]));
            }
          }

          if (returnCheck) {
            definitions.push(t.variableDeclaration('const', [t.variableDeclarator(body.scope.getData('returnTypeUid'), context.call('return', returnCheck))]));
          }
        } else {
          var returnTypeUid = body.scope.generateUidIdentifier('returnType');
          body.scope.setData('returnTypeUid', returnTypeUid);
          var promised = getPromisedType(context, returnType);
          if (!path.node.async && promised) {
            returnTypeUid.__isPromise = true;
            definitions.push(t.variableDeclaration('const', [t.variableDeclarator(returnTypeUid, context.call('return', (0, _convert2.default)(context, promised)))]));
          } else {
            definitions.push(t.variableDeclaration('const', [t.variableDeclarator(returnTypeUid, context.call('return', (0, _convert2.default)(context, returnType)))]));
          }
        }
      }
      if (definitions.length > 0 || invocations.length > 0) {
        body.unshiftContainer('body', definitions.concat(invocations));
      }
    },
    ReturnStatement: function ReturnStatement(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var fn = path.scope.getFunctionParent().path;
      if (!shouldCheck || !fn.has('returnType')) {
        return;
      }
      var argument = path.get('argument');

      var returnTypeUid = path.scope.getData('returnTypeUid');
      if (returnTypeUid.__isPromise) {
        var arg = path.scope.generateUidIdentifier('arg');
        context.replacePath(argument, t.callExpression(t.memberExpression(argument.node, t.identifier('then')), [t.arrowFunctionExpression([arg], context.assert(returnTypeUid, arg))]));
      } else {
        context.replacePath(argument, context.assert.apply(context, [returnTypeUid].concat(_toConsumableArray(argument.node ? [argument.node] : []))));
      }
    },
    YieldExpression: function YieldExpression(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      var fn = path.scope.getFunctionParent().path;
      if (!shouldCheck || !fn.has('returnType')) {
        return;
      }
      if (context.visited.has(path.node)) {
        return;
      }
      var returnType = fn.get('returnType');
      if (returnType.isTypeAnnotation()) {
        returnType = returnType.get('typeAnnotation');
      }
      if (!returnType.isGenericTypeAnnotation()) {
        return;
      }
      var yieldTypeUid = path.scope.getData('yieldTypeUid');
      var nextTypeUid = path.scope.getData('nextTypeUid');

      var argument = path.get('argument');
      var replacement = void 0;
      if (yieldTypeUid) {
        if (path.node.delegate) {
          replacement = t.yieldExpression(t.callExpression(context.call('wrapIterator', yieldTypeUid), argument.node ? [argument.node] : []), true);
        } else {
          replacement = t.yieldExpression(context.assert.apply(context, [yieldTypeUid].concat(_toConsumableArray(argument.node ? [argument.node] : []))));
        }
        context.visited.add(replacement);
      } else {
        replacement = path.node;
      }

      if (nextTypeUid) {
        if (path.parentPath.isExpressionStatement()) {
          context.replacePath(path, replacement);
        } else {
          context.replacePath(path, context.assert(nextTypeUid, replacement));
        }
      }
    },


    Class: {
      exit: function exit(path) {
        if (context.shouldSuppressPath(path)) {
          path.skip();
          return;
        } else if (!shouldCheck) {
          return;
        }

        var body = path.get('body');

        var typeParametersSymbolUid = context.getClassData(path, 'typeParametersSymbolUid');

        if (typeParametersSymbolUid) {
          path.getStatementParent().insertBefore(t.variableDeclaration('const', [t.VariableDeclarator(t.identifier(typeParametersSymbolUid), t.callExpression(t.identifier('Symbol'), [t.stringLiteral(context.getClassData(path, 'currentClassName') + 'TypeParameters')]))]));

          var staticProp = t.classProperty(context.symbol('TypeParameters'), t.identifier(typeParametersSymbolUid));
          staticProp.computed = true;
          staticProp.static = true;
          body.unshiftContainer('body', staticProp);
        }

        var typeParameters = (0, _getTypeParameters2.default)(path);

        var hasTypeParameters = typeParameters.length > 0;

        var superTypeParameters = path.has('superTypeParameters') ? path.get('superTypeParameters.params') : [];

        var hasSuperTypeParameters = superTypeParameters.length > 0;
        if (path.has('superClass') && isReactComponentClass(path.get('superClass'))) {
          var annotation = hasSuperTypeParameters ? superTypeParameters[0] : getClassPropertyAnnotation(path, 'props');

          if (annotation) {
            var propTypes = t.classProperty(t.identifier('propTypes'), context.call('propTypes', (0, _convert2.default)(context, annotation)));
            propTypes.static = true;
            body.unshiftContainer('body', propTypes);
          }
        }

        var hasImplements = path.has('implements');

        if (!shouldCheck || !hasTypeParameters && !hasSuperTypeParameters && !hasImplements) {
          // Nothing to do here.
          return;
        }

        var _body$get$filter = body.get('body').filter(function (item) {
          return item.node.kind === 'constructor';
        }),
            _body$get$filter2 = _slicedToArray(_body$get$filter, 1),
            constructor = _body$get$filter2[0];

        var typeParametersUid = t.identifier(context.getClassData(path, 'typeParametersUid'));

        var thisTypeParameters = t.memberExpression(t.thisExpression(), t.identifier(typeParametersSymbolUid || '___NONE___'), true);

        var constructorBlock = constructor.get('body');

        if (path.has('superClass')) {

          var trailer = [];
          if (hasTypeParameters) {
            constructorBlock.unshiftContainer('body', t.variableDeclaration('const', [t.variableDeclarator(typeParametersUid, t.objectExpression(typeParameters.map(function (typeParameter) {
              return t.objectProperty(t.identifier(typeParameter.node.name), (0, _convert2.default)(context, typeParameter));
            })))]));

            trailer.push(t.expressionStatement(t.assignmentExpression('=', thisTypeParameters, typeParametersUid)));
          }

          if (hasSuperTypeParameters) {
            trailer.push(t.expressionStatement(context.call.apply(context, ['bindTypeParameters', t.thisExpression()].concat(_toConsumableArray(superTypeParameters.map(function (item) {
              return (0, _convert2.default)(context, item);
            }))))));
          }

          if (hasImplements) {
            constructorBlock.pushContainer('body', path.get('implements').map(function (item) {
              return t.expressionStatement(context.assert((0, _convert2.default)(context, item), t.thisExpression()));
            }));
          }
          getSuperStatement(constructorBlock).insertAfter(trailer);
        } else {
          if (hasImplements) {
            constructorBlock.pushContainer('body', path.get('implements').map(function (item) {
              return t.expressionStatement(context.assert((0, _convert2.default)(context, item), t.thisExpression()));
            }));
          }
          if (hasTypeParameters) {
            constructorBlock.unshiftContainer('body', t.expressionStatement(t.assignmentExpression('=', thisTypeParameters, t.objectExpression(typeParameters.map(function (typeParameter) {
              return t.objectProperty(t.identifier(typeParameter.node.name), (0, _convert2.default)(context, typeParameter));
            })))));
          }
        }

        if (hasTypeParameters) {
          var staticMethods = body.get('body').filter(function (item) {
            return item.isClassMethod() && item.node.static;
          });

          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = staticMethods[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var method = _step5.value;

              method.get('body').unshiftContainer('body', t.variableDeclaration('const', [t.variableDeclarator(typeParametersUid, t.objectExpression(typeParameters.map(function (typeParameter) {
                return t.objectProperty(t.identifier(typeParameter.node.name), (0, _convert2.default)(context, typeParameter));
              })))]));
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }
        }
      }
    },

    ClassProperty: function ClassProperty(path) {
      if (context.shouldSuppressPath(path)) {
        path.skip();
        return;
      }
      if (!shouldCheck || !path.has('typeAnnotation') || path.node.computed) {
        return;
      }
      var typeAnnotation = path.get('typeAnnotation');
      var decorator = void 0;
      if (annotationReferencesClassEntity(context, typeAnnotation)) {
        var args = [t.functionExpression(null, [], t.blockStatement([t.returnStatement((0, _convert2.default)(context, typeAnnotation))]))];
        if (context.shouldWarn) {
          args.push(t.booleanLiteral(false));
        }
        decorator = t.decorator(context.call.apply(context, ['decorate'].concat(args)));
      } else if (context.shouldWarn) {
        decorator = t.decorator(context.call('decorate', (0, _convert2.default)(context, typeAnnotation), t.booleanLiteral(false)));
      } else {
        decorator = t.decorator(context.call('decorate', (0, _convert2.default)(context, typeAnnotation)));
      }
      if (!path.has('decorators')) {
        path.node.decorators = [];
      }
      path.unshiftContainer('decorators', decorator);
    }
  };
}

function isReactComponentClass(path) {
  if (path.isIdentifier()) {
    return path.node.name === path.scope.getData('reactComponentClass') || path.node.name === path.scope.getData('reactPureComponentClass');
  } else if (path.isMemberExpression() && !path.node.computed) {
    var object = path.get('object');
    var property = path.get('property');
    if (!object.isIdentifier() || object.node.name !== path.scope.getData('reactLib')) {
      return false;
    }
    return property.isIdentifier() && (property.node.name === 'Component' || property.node.name === 'PureComponent');
  } else {
    return false;
  }
}

var supportedIterableNames = {
  Generator: true,
  Iterable: true,
  Iterator: true,
  AsyncGenerator: true,
  AsyncIterable: true,
  AsyncIterator: true
};

function getPromisedType(context, returnType) {
  if (!returnType.isGenericTypeAnnotation()) {
    return;
  }
  var id = returnType.get('id');
  var name = id.node.name;
  if (name !== 'Promise') {
    return;
  }
  var returnTypeParameters = (0, _getTypeParameters2.default)(returnType);
  if (returnTypeParameters.length === 0) {
    return;
  }
  return returnTypeParameters[0];
}
/**
 * Gets the inner checks for a given return type.
 * This is used for async functions and generators.
 * Returns either null or an array of check nodes in the format: Y, R, N.
 */
function getFunctionInnerChecks(context, path, returnType) {
  if (!path.node.async && !path.node.generator) {
    return;
  }
  if (!returnType.isGenericTypeAnnotation()) {
    return;
  }
  var returnTypeParameters = (0, _getTypeParameters2.default)(returnType);
  var id = returnType.get('id');
  var name = id.node.name;
  if (returnTypeParameters.length === 0) {
    // We're in an async or generator function but we don't have any type parameters.
    // We have to treat this as mixed.
    return [null, context.call('mixed'), null];
  }

  if (path.node.generator) {
    if (supportedIterableNames[name]) {
      var extra = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = returnTypeParameters[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var param = _step6.value;

          extra.push((0, _convert2.default)(context, param));
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return extra;
    }
  } else if (path.node.async) {
    // Make the return type a union with the promise resolution type.
    return [null, context.call('union', (0, _convert2.default)(context, returnTypeParameters[0]), (0, _convert2.default)(context, returnType)), null];
  }
}

function getClassPropertyAnnotation(path, name) {
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = path.get('body.body')[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var item = _step7.value;

      if (item.isClassProperty() && item.get('key').isIdentifier() && !item.node.computed && item.node.key.name === name) {
        return item.get('typeAnnotation');
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }
}

function annotationReferencesClassEntity(context, annotation) {
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = (0, _typeAnnotationIterator2.default)(annotation)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var item = _step8.value;

      if (item.type !== 'Identifier') {
        continue;
      }
      var entity = context.getEntity(item.node.name, annotation);
      if (entity && entity.isClassTypeParameter) {
        return true;
      } else if (entity && entity.isValue && !entity.isGlobal) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return false;
}

function getSuperStatement(block) {
  var found = void 0;
  block.traverse({
    Super: function Super(path) {
      found = path.getStatementParent();
    }
  });
  (0, _assert.ok)(found, "Constructor of sub class must contain super().");
  return found;
}